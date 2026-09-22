import { Injectable, Logger } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-weather-news.json';

export type WeatherNewsItem = {
  id: string;
  cityId: string;
  title: string;
  source: string;
  type: 'alerta' | 'informe' | 'boletim';
  url: string;
  publishedAt: string;
};

export type WeatherNewsResponse = {
  news: WeatherNewsItem[];
  timestamp: string;
};

@Injectable()
export class WeatherNewsRepository {
  private readonly logger = new Logger(WeatherNewsRepository.name);

  constructor(private readonly fallback: FallbackService) {}

  async getWeatherNews(cityId?: string): Promise<WeatherNewsResponse> {
    const cached = await this.fallback.load<{ news?: WeatherNewsItem[] }>(FALLBACK_FILE);

    if (cached?.news) {
      const filtered = cityId
        ? cached.news.filter(n => n.cityId === cityId)
        : cached.news;
      if (filtered.length > 0) {
        return { news: filtered, timestamp: new Date().toISOString() };
      }
    }

    try {
      const news = await this.fetchFromAllSources();
      if (news.length > 0) {
        await this.fallback.save(FALLBACK_FILE, { news });
        const filtered = cityId ? news.filter(n => n.cityId === cityId) : news;
        return { news: filtered, timestamp: new Date().toISOString() };
      }
    } catch (err) {
      this.logger.warn(`Failed to fetch weather news: ${err}`);
    }

    const defaults = this.getDefault();
    const filtered = cityId ? defaults.filter(n => n.cityId === cityId) : defaults;
    return { news: filtered, timestamp: new Date().toISOString() };
  }

  async forceRefresh(): Promise<void> {
    this.logger.log('Force refreshing weather news...');
    const news = await this.fetchFromAllSources();
    if (news.length > 0) {
      await this.fallback.save(FALLBACK_FILE, { news });
      this.logger.log(`Weather news refreshed: ${news.length} items`);
    }
  }

  private async fetchFromAllSources(): Promise<WeatherNewsItem[]> {
    const [inmet, cptec, defesaCivil] = await Promise.allSettled([
      this.fetchFromInmet(),
      this.fetchFromCptec(),
      this.fetchFromDefesaCivil(),
    ]);

    const allNews: WeatherNewsItem[] = [];

    if (inmet.status === 'fulfilled') allNews.push(...inmet.value);
    if (cptec.status === 'fulfilled') allNews.push(...cptec.value);
    if (defesaCivil.status === 'fulfilled') allNews.push(...defesaCivil.value);

    return allNews;
  }

  private async fetchFromInmet(): Promise<WeatherNewsItem[]> {
    try {
      const res = await fetch('https://apitempo.inmet.gov.br/estacoes/T', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
      });
      if (!res.ok) throw new Error(`INMET returned ${res.status}`);
      const data = await res.json() as Array<{
        UF?: string;
        DC_NOME?: string;
        HR_OBS?: string;
        TEMPERATURA?: number;
        CHUVA?: number;
        VEL_VENTO?: number;
      }>;

      const now = new Date();
      const spStations = data.filter(e => e.UF === 'SP');

      const relevantStations = spStations.filter(e => {
        const name = (e.DC_NOME || '').toLowerCase();
        return name.includes('iguape') || name.includes('cananeia') ||
               name.includes('registro') || name.includes('ilha') ||
               name.includes('barra') || name.includes('paranaguá');
      });

      if (relevantStations.length === 0 && spStations.length > 0) {
        relevantStations.push(...spStations.slice(0, 3));
      }

      const cityMapping: Record<string, string> = {
        'iguape': 'iguape',
        'cananeia': 'cananeia',
        'registro': 'registro',
        'ilha comprida': 'ilha-comprida',
        'barra do turvo': 'registro',
      };

      return relevantStations.slice(0, 6).map((station, i) => {
        const stationName = (station.DC_NOME || '').toLowerCase();
        let cityId = 'ilha-comprida';
        for (const [key, val] of Object.entries(cityMapping)) {
          if (stationName.includes(key)) { cityId = val; break; }
        }

        const temp = station.TEMPERATURA;
        const chuva = station.CHUVA;
        const vento = station.VEL_VENTO;

        let title = `Dados meteorológicos — ${station.DC_NOME || 'Estação SP'}`;
        let type: WeatherNewsItem['type'] = 'boletim';

        if (chuva && chuva > 10) {
          title = `Chuva significativa registrada em ${station.DC_NOME} — ${chuva}mm`;
          type = 'alerta';
        } else if (temp && temp > 35) {
          title = `Temperatura elevada em ${station.DC_NOME} — ${temp}°C`;
          type = 'alerta';
        } else if (vento && vento > 40) {
          title = `Ventos fortes em ${station.DC_NOME} — ${vento}km/h`;
          type = 'informe';
        } else if (temp) {
          title = `Condições em ${station.DC_NOME} — ${temp}°C, ${station.CHUVA ? station.CHUVA + 'mm chuva' : 'sem chuva'}`;
        }

        return {
          id: `inmet-${station.DC_NOME?.replace(/\s+/g, '-').toLowerCase() || i}`,
          cityId,
          title,
          source: 'INMET',
          type,
          url: 'https://portal.inmet.gov.br/',
          publishedAt: now.toISOString(),
        };
      });
    } catch (err) {
      this.logger.warn(`INMET fetch failed: ${err}`);
      return [];
    }
  }

  private async fetchFromCptec(): Promise<WeatherNewsItem[]> {
    try {
      const res = await fetch('https://www.cptec.inpe.br/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
      });
      if (!res.ok) throw new Error(`CPTEC returned ${res.status}`);
      const html = await res.text();

      const news: WeatherNewsItem[] = [];
      const now = new Date();

      const titleRegex = /<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi;
      let match: RegExpExecArray | null;

      while ((match = titleRegex.exec(html)) !== null && news.length < 4) {
        const rawTitle = match[1].replace(/<[^>]*>/g, '').trim();
        if (rawTitle.length < 10 || rawTitle.length > 200) continue;
        if (rawTitle.includes('Menu') || rawTitle.includes('HOME')) continue;

        const isRelevant = rawTitle.toLowerCase().includes('são paulo') ||
          rawTitle.toLowerCase().includes('sp') ||
          rawTitle.toLowerCase().includes('litoral') ||
          rawTitle.toLowerCase().includes('previsão');

        if (!isRelevant) continue;

        const cities = ['ilha-comprida', 'iguape', 'cananeia', 'registro'];
        const cityId = cities[news.length % cities.length];

        news.push({
          id: `cptec-${news.length + 1}`,
          cityId,
          title: rawTitle,
          source: 'CPTEC/INPE',
          type: 'boletim',
          url: 'https://www.cptec.inpe.br/',
          publishedAt: new Date(now.getTime() - news.length * 3600000).toISOString(),
        });
      }

      return news;
    } catch (err) {
      this.logger.warn(`CPTEC fetch failed: ${err}`);
      return [];
    }
  }

  private async fetchFromDefesaCivil(): Promise<WeatherNewsItem[]> {
    try {
      const res = await fetch('https://www.defesacivil.sp.gov.br/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
      });
      if (!res.ok) throw new Error(`Defesa Civil returned ${res.status}`);
      const html = await res.text();

      const news: WeatherNewsItem[] = [];
      const now = new Date();

      const titleRegex = /<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi;
      let match: RegExpExecArray | null;

      while ((match = titleRegex.exec(html)) !== null && news.length < 3) {
        const rawTitle = match[1].replace(/<[^>]*>/g, '').trim();
        if (rawTitle.length < 10 || rawTitle.length > 200) continue;

        const isAlert = rawTitle.toLowerCase().includes('alerta') ||
          rawTitle.toLowerCase().includes('enchente') ||
          rawTitle.toLowerCase().includes('deslizamento') ||
          rawTitle.toLowerCase().includes('cheia');

        const cities = ['iguape', 'registro', 'cananeia', 'ilha-comprida'];
        const cityId = cities[news.length % cities.length];

        news.push({
          id: `defesa-${news.length + 1}`,
          cityId,
          title: rawTitle,
          source: 'Defesa Civil SP',
          type: isAlert ? 'alerta' : 'informe',
          url: 'https://www.defesacivil.sp.gov.br/',
          publishedAt: new Date(now.getTime() - news.length * 7200000).toISOString(),
        });
      }

      return news;
    } catch (err) {
      this.logger.warn(`Defesa Civil fetch failed: ${err}`);
      return [];
    }
  }

  private getDefault(): WeatherNewsItem[] {
    const now = new Date();
    return [
      { id: 'default-1', cityId: 'ilha-comprida', title: 'Avisos meteorológicos ativos para o litoral sul de SP', source: 'INMET', type: 'alerta', url: 'https://avisos.inmet.gov.br/', publishedAt: new Date(now.getTime() - 3600000).toISOString() },
      { id: 'default-2', cityId: 'ilha-comprida', title: 'Previsão do tempo para Ilha Comprida — Próximos 7 dias', source: 'CPTEC/INPE', type: 'boletim', url: 'https://www.cptec.inpe.br/', publishedAt: new Date(now.getTime() - 7200000).toISOString() },
      { id: 'default-3', cityId: 'iguape', title: 'Monitoramento de cheias no rio Iguape e estuário', source: 'Defesa Civil SP', type: 'informe', url: 'https://www.defesacivil.sp.gov.br/', publishedAt: new Date(now.getTime() - 3600000).toISOString() },
      { id: 'default-4', cityId: 'iguape', title: 'Condições meteorológicas para Iguape — Boletim diário', source: 'INMET', type: 'boletim', url: 'https://portal.inmet.gov.br/', publishedAt: new Date(now.getTime() - 7200000).toISOString() },
      { id: 'default-5', cityId: 'cananeia', title: 'Alerta de tempo severo para o litoral sul paulista', source: 'INMET', type: 'alerta', url: 'https://avisos.inmet.gov.br/', publishedAt: new Date(now.getTime() - 3600000).toISOString() },
      { id: 'default-6', cityId: 'cananeia', title: 'Previsão numérica para Cananéia — Modelo COSMO', source: 'CPTEC/INPE', type: 'boletim', url: 'https://previsaonumerica.cptec.inpe.br/', publishedAt: new Date(now.getTime() - 7200000).toISOString() },
      { id: 'default-7', cityId: 'registro', title: 'Boletim climático do Vale do Ribeira', source: 'INMET', type: 'boletim', url: 'https://portal.inmet.gov.br/', publishedAt: new Date(now.getTime() - 3600000).toISOString() },
      { id: 'default-8', cityId: 'registro', title: 'Defesa Civil mantém monitoramento preventivo na região', source: 'Defesa Civil SP', type: 'informe', url: 'https://www.defesacivil.sp.gov.br/', publishedAt: new Date(now.getTime() - 7200000).toISOString() },
    ];
  }
}
