import { Injectable, Logger } from '@nestjs/common';
import { MeteorologyService } from '../meteorology/meteorology.service';
import { OceanographyService } from '../oceanography/oceanography.service';
import { TrafficService } from '../traffic/traffic.service';
import { ComercioService } from '../comercio/comercio.service';
import { NoticiasRegionaisService } from '../noticias-regionais/noticias-regionais.service';

type ChatResponse = {
  reply: string;
  data?: Record<string, unknown>;
};

@Injectable()
export class IronService {
  private readonly logger = new Logger(IronService.name);

  constructor(
    private readonly meteorologyService: MeteorologyService,
    private readonly oceanographyService: OceanographyService,
    private readonly trafficService: TrafficService,
    private readonly comercioService: ComercioService,
    private readonly noticiasService: NoticiasRegionaisService,
  ) {}

  async processMessage(message: string): Promise<ChatResponse> {
    const q = message.toLowerCase().trim();

    try {
      if (q.includes('tempo') || q.includes('clima') || q.includes('temperatura') || q.includes('chuva') || q.includes('sol')) {
        return this.getMeteorologyResponse(q);
      }
      if (q.includes('onda') || q.includes('swell') || q.includes('surf') || q.includes('mar') || q.includes('mare') || q.includes('maré')) {
        return this.getOceanographyResponse(q);
      }
      if (q.includes('vento') || q.includes('kite') || q.includes('windsurf') || q.includes(' rajada')) {
        return this.getWindResponse(q);
      }
      if (q.includes('transito') || q.includes('trânsito') || q.includes('rodovia') || q.includes('balsa') || q.includes('br-116') || q.includes('sp-222')) {
        return this.getTrafficResponse(q);
      }
      if (q.includes('comercio') || q.includes('comércio') || q.includes('restaurante') || q.includes('hotel') || q.includes('pousada') || q.includes('loja')) {
        return this.getCommerceResponse(q);
      }
      if (q.includes('noticia') || q.includes('notícia') || q.includes('regional')) {
        return this.getNewsResponse(q);
      }
      if (q.includes('picos') || q.includes('spot') || q.includes('prancha')) {
        return this.getSpotsResponse();
      }
      if (q.includes('resumo') || q.includes('briefing') || q.includes('visão geral')) {
        return this.getSummaryResponse();
      }
      if (q.includes('oi') || q.includes('olá') || q.includes('ola') || q.includes('hello')) {
        return { reply: 'Olá! Sou o **Irons**, seu assistente tático de surf e clima. Pergunte sobre previsão do tempo, ondas, vento, trânsito ou comércio na região de Ilha Comprida e Vale do Ribeira.' };
      }
      if (q.includes('quem') || q.includes('sobre') || q.includes('faz')) {
        return { reply: 'Sou o **Irons**, assistente tático do Meteor 2.0. Fui criado em homenagem ao surfista Andy Irons (1978-2010). Meu objetivo é te ajudar com informações sobre clima, surf, trânsito e comércio de Ilha Comprida e Vale do Ribeira. Dados em tempo real de fontes oficiais!' };
      }

      return { reply: '📊 **Consulte os dados em tempo real:** Use as telas do Meteor 2.0 para previsões precisas. Para dúvidas específicas, pergunte sobre:\n\n• 🌤️ Tempo e clima\n• 🏄 Ondas e swell\n• 💨 Vento e rajadas\n• 🚗 Trânsito e rodovias\n• 🏪 Comércio local\n• 📰 Notícias regionais' };
    } catch (err) {
      this.logger.error(`Error processing message: ${err}`);
      return { reply: '⚠️ Erro ao processar sua mensagem. Tente novamente.' };
    }
  }

  private async getMeteorologyResponse(query: string): Promise<ChatResponse> {
    try {
      const data = await this.meteorologyService.getCurrentWeather('ilha-comprida');
      const current = data.current;

      const weatherCode = current.weatherCode;
      const weatherDesc = this.getWeatherDescription(weatherCode);

      let reply = `🌤️ **Previsão para Ilha Comprida:**\n\n`;
      reply += `• **Temperatura:** ${Math.round(current.temperature)}°C (sensação ${Math.round(current.apparentTemperature)}°C)\n`;
      reply += `• **Condição:** ${weatherDesc}\n`;
      reply += `• **Umidade:** ${current.humidity}%\n`;
      reply += `• **Vento:** ${current.windSpeed} km/h de ${this.getWindDirection(current.windDirection)}\n`;
      reply += `• **Chuva:** ${current.precipitation} mm\n`;
      reply += `• **Pressão:** ${current.pressure} hPa\n\n`;

      if (query.includes('chuva')) {
        reply += current.precipitation > 0
          ? `🌧️ **Chuva atual:** ${current.precipitation} mm. Use proteção!`
          : `☀️ **Sem chuva no momento.** Boa saída!`;
      }
      if (query.includes('sol')) {
        reply += current.weatherCode <= 2
          ? `☀️ **Dia de sol!** Índice UV pode estar alto. Use protetor solar.`
          : `☁️ **Dia nublado.** Temperatura agradável para praia.`;
      }

      return { reply, data: { temperature: current.temperature, humidity: current.humidity, precipitation: current.precipitation } };
    } catch {
      return { reply: '⚠️ Dados meteorológicos indisponíveis no momento. Tente novamente em alguns instantes.' };
    }
  }

  private async getOceanographyResponse(query: string): Promise<ChatResponse> {
    try {
      const data = await this.oceanographyService.getSwellConditions();
      const current = data.current;

      let reply = `🏄 **Condições do Mar — Ilha Comprida:**\n\n`;
      reply += `• **Onda:** ${current.waveHeight}m | Período: ${current.wavePeriod}s | Direção: ${current.waveDirection}°\n`;
      reply += `• **Swell:** ${current.swellHeight}m | Período: ${current.swellPeriod}s\n`;
      reply += `• **Qualidade:** ${data.qualityLabel}\n`;
      reply += `• **Melhor horário:** ${data.bestTime}\n`;
      reply += `• **Próxima maré:** ${data.nextTide} (coef. ${data.tideCoefficient})\n\n`;

      if (query.includes('mare') || query.includes('maré')) {
        reply += `🌙 **Marés:** Próxima alta em ${data.nextTide}. Coeficiente ${data.tideCoefficient > 0.7 ? 'alto — cuidado com correntes' : 'moderado — condições seguras'}.`;
      }
      if (query.includes('surf')) {
        reply += `🏄 **Para surf:** ${data.qualityLabel === 'Clássico!' ? 'Condições excelentes!' : data.qualityLabel === 'Boas' ? 'Boas condições!' : 'Ondas menores, ideal para iniciantes.'}`;
      }

      return { reply, data: { waveHeight: current.waveHeight, qualityLabel: data.qualityLabel } };
    } catch {
      return { reply: '⚠️ Dados oceânicos indisponíveis no momento. Tente novamente em alguns instantes.' };
    }
  }

  private async getWindResponse(query: string): Promise<ChatResponse> {
    try {
      const hourly = await this.oceanographyService.getHourlyForecast();
      if (!hourly || hourly.length === 0) {
        return { reply: '⚠️ Dados de vento indisponíveis no momento.' };
      }

      const current = hourly[0];
      const maxWind = Math.max(...hourly.map((h) => h.windSpeed));
      const maxGust = Math.max(...hourly.map((h) => h.windGust));

      let reply = `💨 **Previsão de Vento:**\n\n`;
      reply += `• **Atual:** ${current.windSpeed} km/h de ${this.getWindDirection(current.windDirection)}\n`;
      reply += `• **Rajada:** ${current.windGust} km/h\n`;
      reply += `• **Máxima prevista:** ${maxWind} km/h\n`;
      reply += `• **Rajada máxima:** ${maxGust} km/h\n\n`;

      const kiteQuality = this.getKiteQuality(current.windSpeed);
      const surfQuality = this.getSurfWindQuality(current.windSpeed, current.windDirection);

      reply += `🪁 **Kitesurf:** ${kiteQuality}\n`;
      reply += `🏄 **Surf:** ${surfQuality}\n`;

      return { reply, data: { windSpeed: current.windSpeed, windGust: current.windGust, windDirection: current.windDirection } };
    } catch {
      return { reply: '⚠️ Dados de vento indisponíveis no momento.' };
    }
  }

  private async getTrafficResponse(_query: string): Promise<ChatResponse> {
    try {
      const data = await this.trafficService.getTraffic();

      let reply = `🚗 **Trânsito na Região:**\n\n`;

      for (const route of data.routes) {
        const emoji = route.condition === 'LIVRE' ? '🟢' : route.condition === 'MODERADO' ? '🟡' : route.condition === 'LENTO' ? '🟠' : '🔴';
        reply += `${emoji} **${route.name}** (${route.stretch}): ${route.condition}`;
        if (route.waitTimeMinutes) reply += ` — ${route.waitTimeMinutes} min`;
        reply += '\n';
      }

      return { reply, data: { routes: data.routes.length } };
    } catch {
      return { reply: '⚠️ Dados de trânsito indisponíveis no momento.' };
    }
  }

  private async getCommerceResponse(query: string): Promise<ChatResponse> {
    try {
      const commerce = this.comercioService.getAllCommerce();

      const sectors = [...new Set(commerce.map((c) => c.sector))];
      const bySector = sectors.map((s) => ({
        sector: s,
        count: commerce.filter((c) => c.sector === s).length,
      }));

      let reply = `🏪 **Comércio de Ilha Comprida:**\n\n`;
      reply += `**${commerce.length}** estabelecimentos em **${sectors.length}** setores:\n\n`;

      for (const s of bySector) {
        reply += `• ${s.sector}: ${s.count} estabelecimentos\n`;
      }

      if (query.includes('restaurante') || query.includes('comida')) {
        const food = commerce.filter((c) => c.sector === 'Alimentação').slice(0, 3);
        reply += `\n🍽️ **Destaques em alimentação:**\n`;
        for (const f of food) {
          reply += `• ${f.name} — ${f.description || f.address}\n`;
        }
      }
      if (query.includes('hotel') || query.includes('pousada') || query.includes('hospedagem')) {
        const hotels = commerce.filter((c) => c.sector === 'Hospedagem').slice(0, 3);
        reply += `\n🏨 **Hospedagens:**\n`;
        for (const h of hotels) {
          reply += `• ${h.name} — ${h.description || h.address}\n`;
        }
      }

      return { reply, data: { total: commerce.length, sectors: sectors.length } };
    } catch {
      return { reply: '⚠️ Dados de comércio indisponíveis no momento.' };
    }
  }

  private async getNewsResponse(_query: string): Promise<ChatResponse> {
    try {
      const data = this.noticiasService.getData();

      let reply = `📰 **Notícias Regionais:**\n\n`;
      const news = data.news.slice(0, 5);
      for (const n of news) {
        reply += `• **${n.title}** — ${n.category}\n`;
      }
      reply += `\nTotal de **${data.news.length}** notícias disponíveis na tela de Notícias.`;

      return { reply, data: { total: data.news.length } };
    } catch {
      return { reply: '⚠️ Dados de notícias indisponíveis no momento.' };
    }
  }

  private async getSpotsResponse(): Promise<ChatResponse> {
    const spots = [
      { name: 'Juréia', level: 'Avançado', bestWind: 'Oeste (Terral)' },
      { name: 'Ponta da Praia Norte', level: 'Iniciante', bestWind: 'Sudoeste' },
      { name: 'Boqueirão Norte', level: 'Intermediário', bestWind: 'Oeste (Terral)' },
      { name: 'Boqueirão Sul', level: 'Avançado', bestWind: 'Noroeste (Terral)' },
      { name: 'Costão do Sul', level: 'Intermediário', bestWind: 'Oeste (Terral)' },
      { name: 'Parada do Surf', level: 'Iniciante', bestWind: 'Qualquer' },
    ];

    let reply = `📍 **Spots de Surf — Ilha Comprida:**\n\n`;
    for (const spot of spots) {
      reply += `• **${spot.name}** (${spot.level}) — Vento ideal: ${spot.bestWind}\n`;
    }
    reply += `\nAcesse a tela de Swell para mapa interativo e detalhes de cada pico.`;

    return { reply, data: { spots: spots.length } };
  }

  private async getSummaryResponse(): Promise<ChatResponse> {
    try {
      const [met, ocean, traffic] = await Promise.allSettled([
        this.meteorologyService.getCurrentWeather('ilha-comprida'),
        this.oceanographyService.getSwellConditions(),
        this.trafficService.getTraffic(),
      ]);

      let reply = `📊 **Resumo Tático — Ilha Comprida:**\n\n`;

      if (met.status === 'fulfilled') {
        const m = met.value.current;
        reply += `🌤️ **Tempo:** ${Math.round(m.temperature)}°C, ${this.getWeatherDescription(m.weatherCode)}, ${m.humidity}% umidade\n`;
      }
      if (ocean.status === 'fulfilled') {
        const o = ocean.value;
        reply += `🏄 **Mar:** Ondas ${o.current.waveHeight}m (${o.qualityLabel}), período ${o.current.wavePeriod}s\n`;
      }
      if (traffic.status === 'fulfilled') {
        const t = traffic.value;
        const free = t.routes.filter((r: { condition: string }) => r.condition === 'LIVRE').length;
        reply += `🚗 **Trânsito:** ${free}/${t.routes.length} rodovias livres\n`;
      }

      reply += `\n💡 **Dica:** Acesse as telas individuais para dados detalhados.`;

      return { reply };
    } catch {
      return { reply: '⚠️ Erro ao gerar resumo tático.' };
    }
  }

  private getWeatherDescription(code: number): string {
    const descriptions: Record<number, string> = {
      0: 'Céu limpo', 1: 'Principalmente limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
      45: 'Nevoeiro', 48: 'Nevoeiro com geada',
      51: 'Chuva leve', 53: 'Chuva moderada', 55: 'Chuva forte',
      61: 'Chuva leve', 63: 'Chuva moderada', 65: 'Chuva forte',
      80: 'Pancadas leves', 81: 'Pancadas moderadas', 82: 'Pancadas fortes',
      95: 'Tempestade', 96: 'Tempestade com granizo', 99: 'Tempestade com granizo',
    };
    return descriptions[code] ?? 'Condição desconhecida';
  }

  private getWindDirection(deg: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8] ?? 'N';
  }

  private getKiteQuality(speed: number): string {
    if (speed < 12) return 'Insuficiente';
    if (speed < 18) return 'Bom (leve)';
    if (speed < 25) return 'Ótimo!';
    if (speed < 35) return 'Excelente!';
    return 'Perigoso!';
  }

  private getSurfWindQuality(speed: number, direction: number): string {
    if (speed < 6) return 'Sem vento — mar liso';
    const isOffshore = direction > 225 && direction < 315;
    if (isOffshore) return 'Offshore — favorável!';
    return 'Onshore — desfavorável';
  }
}
