import { Injectable, Logger } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';
import { singleFlight } from '../../common/async/single-flight';
import { WslRepository, WslRankingEntry, WslEvent } from './wsl.repository';
import { SpsurfRepository, SpsurfNewsItem } from './spsurf.repository';

const FALLBACK_FILE = 'fallback-news.json';

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  url: string;
  description: string;
  image: string;
  category: 'WSL' | 'Paulista';
  publishedAt: string;
  /** true = item de exemplo (datas congeladas, fallback quando a fonte cai). */
  sample?: boolean;
};

export type NewsResponse = {
  news: NewsItem[];
  rankings: { men: WslRankingEntry[]; women: WslRankingEntry[] };
  events: WslEvent[];
  timestamp: string;
};

type FallbackNewsData = {
  news: NewsItem[];
  rankings: { men: WslRankingEntry[]; women: WslRankingEntry[] };
  events: WslEvent[];
};

@Injectable()
export class NewsRepository {
  private readonly logger = new Logger(NewsRepository.name);
  private cache: NewsResponse | null = null;
  private readonly CACHE_TTL_MS = 30 * 60 * 1000;

  constructor(
    private readonly wslRepo: WslRepository,
    private readonly spsurfRepo: SpsurfRepository,
    private readonly fallback: FallbackService,
  ) {}

  async forceRefresh(): Promise<void> {
    this.logger.log('Force refreshing news data...');
    this.cache = null;
    await this.getNewsData();
  }

  async getNewsData(): Promise<NewsResponse> {
    if (this.cache && Date.now() - new Date(this.cache.timestamp).getTime() < this.CACHE_TTL_MS) {
      return this.cache;
    }

    // Single-flight: cold start gera N requests simultaneos; 1 pipeline de fetch
    // (WSL rankings + noticias + SPSurf + Google News) para todos.
    return singleFlight('news:data', () => this.fetchNewsData());
  }

  private async fetchNewsData(): Promise<NewsResponse> {
    try {
      const [wslRankings, spsurfNews] = await Promise.all([
        this.wslRepo.getRankings(),
        this.spsurfRepo.getNews(),
      ]);

      const wslNews = await this.buildWslNews();
      const allNews = [...wslNews, ...this.buildSpsurfNews(spsurfNews)];
      const filtered = this.filterLast7Days(allNews);
      const finalNews = this.ensureExactly12(filtered);

      const result: NewsResponse = {
        news: finalNews,
        rankings: { men: wslRankings.men, women: wslRankings.women },
        events: wslRankings.events,
        timestamp: new Date().toISOString(),
      };

      this.cache = result;
      await this.fallback.save(FALLBACK_FILE, {
        news: finalNews,
        rankings: { men: wslRankings.men, women: wslRankings.women },
        events: wslRankings.events,
      });

      return result;
    } catch (err) {
      this.logger.warn(`Failed to fetch news data: ${err}`);
      return this.getFallbackData();
    }
  }

  private async buildWslNews(): Promise<NewsItem[]> {
    const live = await this.wslRepo.getNews();
    if (live.length > 0) {
      return live.slice(0, 6).map(item => ({
        id: `wsl-${this.idFromUrl(item.url)}`,
        title: item.title,
        source: 'WSL Latin America',
        sourceUrl: 'https://wsllatinamerica.com',
        url: item.url,
        description: item.description,
        image: item.image,
        category: 'WSL' as const,
        publishedAt: item.publishedAt,
      }));
    }
    return this.getStaticWslNews();
  }

  private idFromUrl(url: string): string {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
  }

  /** Notícias de EXEMPLO com datas CONGELADAS (nov/2026 — Finals Day real do Philippines Pro). */
  private getStaticWslNews(): NewsItem[] {
    return [
      {
        id: 'wsl-philippines-simmers-medina-campeoes',
        title: 'Simmers e Medina coroados no Finals Day do Philippines Pro em Cloud 9',
        source: 'WSL',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/posts/562664/the-cloud-9-dream-ends-in-legendary-wins-from-simmers-and-medina-corona-post-show-finals-day',
        description: 'Finals Day historico em Cloud 9: Caity Simmers venceu Isabella Nichols (12.00 a 10.77) e Gabriel Medina, Jack Robinson (16.93 a 14.50) para coroar os campeoes do primeiro CT nas Filipinas.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: '2026-11-03T12:00:00.000Z',
        sample: true,
      },
      {
        id: 'wsl-philippines-medina-final',
        title: 'Medina vence final com tubo 9.43 e chega mais perto do tetra mundial',
        source: 'WSL',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/posts/562657/medinas-major-breakthrough-in-2026-arrives-at-the-philippines-pro',
        description: 'Tricampeao mundial somou 16.93 na final (9.43 no tubo + 7.50) sobre Jack Robinson. Medina conquistou a primeira vitoria no CT em 2026 e chega ao Pipeline na disputa pelo titulo.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: '2026-11-02T12:00:00.000Z',
        sample: true,
      },
      {
        id: 'wsl-philippines-simmers-campea',
        title: 'Caity Simmers conquista primeiro titulo da temporada no Philippines Pro',
        source: 'WSL',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/posts/562649/simmers-takes-the-maiden-cloud-9-crown-philippines-pro',
        description: 'Campea em 2024, Simmers venceu Isabella Nichols por 12.00 a 10.77 e subiu para 3a do ranking. Atleta disputou a etapa com sete costuras no pe e eliminou Carissa Moore na semi.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: '2026-11-02T12:00:00.000Z',
        sample: true,
      },
      {
        id: 'wsl-philippines-highlights-finais',
        title: 'Highlights: Philippines Pro fecha etapa historica com espetaculo em Cloud 9',
        source: 'WSL',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/posts/562660/highlights-philippines-pro-presented-by-philippines-sporting-commission-2026-end-of-event',
        description: 'Melhores momentos da Finals Day em Siargao: Simmers e Medina erguem os primeiros trofeios da temporada 2026 diante de uma torcida apaixonada. Disputa pelo titulo vai ao Pipeline de 8 a 20 de dezembro.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: '2026-11-03T12:00:00.000Z',
        sample: true,
      },
      {
        id: 'wsl-philippines-gwm-catch-up',
        title: 'GWM Catch Up Finals Day: Medina e Simmers emocionam torcida nas Filipinas',
        source: 'WSL',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/posts/562662/the-gwm-catch-up-finals-day-medina-and-simmers-provide-cloud-9-spectacle-philippines-pro',
        description: 'Revisao da Finals Day: airshow de Medina contra Yago Dora na semi, tubo 9.43 contra Robinson e a firmeza de Simmers diante de Carissa Moore e Isabella Nichols em Siargao.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: '2026-11-03T12:00:00.000Z',
        sample: true,
      },
      {
        id: 'wsl-philippines-event-guide',
        title: 'Philippines Pro: 11a parada do CT chega a Cloud 9, em Siargao',
        source: 'WSL',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/posts/562297/fan-guide-philippines-pro-presented-by-philippine-sports-commission-2026',
        description: '11a parada do Championship Tour 2026, de 31 de outubro a 10 de novembro, com os 24 melhores homens e 16 melhores mulheres disputando pontos na primeira etapa do CT realizada nas Filipinas.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: '2026-10-24T12:00:00.000Z',
        sample: true,
      },
    ];
  }

  private buildSpsurfNews(items: SpsurfNewsItem[]): NewsItem[] {
    return items.map((item, i) => ({
      id: `spsurf-${i + 1}`,
      title: item.title,
      source: 'SPSurf',
      sourceUrl: 'https://www.spsurf.com.br',
      url: item.url,
      description: item.description,
      image: item.image || this.getSpsurfImage(i),
      category: 'Paulista' as const,
      publishedAt: item.publishedAt,
    }));
  }

  private getSpsurfImage(index: number): string {
    const images = [
      'https://static.wixstatic.com/media/690598_cf6012b3a7aa4ffd8b88893077d96484~mv2.jpeg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/690598_cf6012b3a7aa4ffd8b88893077d96484~mv2.webp',
      'https://static.wixstatic.com/media/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.jpeg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.webp',
      'https://static.wixstatic.com/media/71b9f8_d53b9f235c844cb09ce5789c48052bf6~mv2.jpg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/71b9f8_d53b9f235c844cb09ce5789c48052bf6~mv2.jpg',
      'https://static.wixstatic.com/media/71b9f8_d47f44af83e043a590507fe765bd2d32~mv2.jpg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/71b9f8_d47f44af83e043a590507fe765bd2d32~mv2.jpg',
      'https://static.wixstatic.com/media/71b9f8_1f4cfb108dfd43299fb87ae66da9782c~mv2.jpg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/71b9f8_1f4cfb108dfd43299fb87ae66da9782c~mv2.jpg',
      'https://static.wixstatic.com/media/71b9f8_c9f54baec703476192f96cc92fda3f5d~mv2.jpg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/71b9f8_c9f54baec703476192f96cc92fda3f5d~mv2.jpg',
    ];
    return images[index % images.length];
  }

  private filterLast7Days(news: NewsItem[]): NewsItem[] {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    // Itens sample (datas congeladas) ficam visíveis mesmo antigos — são
    // explicitamente de exemplo, não devem passar por notícia fresca.
    return news.filter(item => item.sample || new Date(item.publishedAt) >= sevenDaysAgo);
  }

  private ensureExactly12(news: NewsItem[]): NewsItem[] {
    if (news.length >= 12) return news.slice(0, 12);

    const extras = this.getExtraNews();
    const combined = [...news];
    for (const extra of extras) {
      if (combined.length >= 12) break;
      if (!combined.find(n => n.id === extra.id)) {
        combined.push(extra);
      }
    }
    return combined.slice(0, 12);
  }

  /** Itens de EXEMPLO com datas CONGELADAS (nov/2026 — Finals Day real do Philippines Pro). */
  private getExtraNews(): NewsItem[] {
    return [
      {
        id: 'wsl-philippines-round1-simmers',
        title: 'Simmers abre o primeiro CT das Filipinas com 9.00 em Cloud 9',
        source: 'WSL',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/posts/562449/simmers-opens-the-first-ever-ct-in-the-philippines-with-a-900-philippines-pro',
        description: 'Campea de 2024 eliminou Caroline Marks na abertura do primeiro Championship Tour realizado nas Filipinas com uma nota 9.00 no tubo de Cloud 9.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: '2026-10-30T12:00:00.000Z',
        sample: true,
      },
      {
        id: 'wsl-philippines-semifinal-robinson',
        title: 'Robinson garante final no Philippines Pro apos duelo contra Ewing',
        source: 'WSL',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/posts/562644/australias-icons-trade-excellence-philippines-pro',
        description: 'Australiano abriu com 8.33 e somou mais 8.30 para levar a semi por 16.63 a 16.00 sobre Ethan Ewing e encarar Medina na final em Cloud 9.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: '2026-11-02T12:00:00.000Z',
        sample: true,
      },
      {
        id: 'spsurf-saosebastiao-pro',
        title: 'Banco do Brasil Sao Sebastiao Pro: WSL chega a SP pela primeira vez',
        source: 'Terra',
        sourceUrl: 'https://www.terra.com.br',
        url: 'https://www.terra.com.br/esportes/surfe/berco-de-gabriel-medina-litoral-de-sp-recebe-etapa-mundial-da-wsl-pela-primeira-vez',
        description: 'Etapa do Challenger Series em Sao Sebastiao de 26/09 a 03/10 na Praia de Maresias. Evento historico.',
        image: 'https://static.wixstatic.com/media/690598_cf6012b3a7aa4ffd8b88893077d96484~mv2.jpeg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/690598_cf6012b3a7aa4ffd8b88893077d96484~mv2.webp',
        category: 'Paulista',
        publishedAt: '2026-09-16T12:00:00.000Z',
        sample: true,
      },
      {
        id: 'spsurf-surf-attack-maresias',
        title: 'Hang Loose Surf Attack 2026: etapa decisiva em Maresias',
        source: 'SPSurf',
        sourceUrl: 'https://www.spsurf.com.br',
        url: 'https://litoralempauta.com.br/sao-sebastiao-recebe-ultima-etapa-do-circuito-hang-loose-surf-attack-em-maresias-nesta-quinta-feira/',
        description: '36a edicao do Surf Attack em Maresias de 17 a 19 de setembro. Etapa decisiva do Ranking Paulista.',
        image: 'https://static.wixstatic.com/media/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.jpeg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.webp',
        category: 'Paulista',
        publishedAt: '2026-09-17T12:00:00.000Z',
        sample: true,
      },
      {
        id: 'spsurf-sunset-reggae',
        title: 'WSL Sunset Reggae Edition chega a Maresias com Maneva e Planta & Raiz',
        source: 'WSL Latin America',
        sourceUrl: 'https://wsllatinamerica.com',
        url: 'https://wsllatinamerica.com/wsl-sunset-chega-a-sao-sebastiao-com-reggae-edition-e-shows-de-maneva-planta-raiz-e-gabriel-elias/',
        description: 'Pela primeira vez no Litoral Norte paulista, WSL Sunset une surfe, musica e cultura em 26 de setembro.',
        image: 'https://static.wixstatic.com/media/71b9f8_d47f44af83e043a590507fe765bd2d32~mv2.jpg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/71b9f8_d47f44af83e043a590507fe765bd2d32~mv2.jpg',
        category: 'Paulista',
        publishedAt: '2026-09-14T12:00:00.000Z',
        sample: true,
      },
      {
        id: 'wsl-philippines-semifinal-interferencia',
        title: 'Interferencia de prioridade define semifinal e leva Simmers a final',
        source: 'WSL',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/posts/562641/interference-updated-simmers-advances-to-the-finals-philippines-pro',
        description: 'Revisao do WSL virou a semifinal feminina em Siargao: Simmers venceu Carissa Moore por 9.43 a 5.67 apos interferencia de prioridade e avancou para o titulo.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: '2026-11-02T12:00:00.000Z',
        sample: true,
      },
    ];
  }

  private async getFallbackData(): Promise<NewsResponse> {
    const cached = await this.fallback.load<FallbackNewsData>(FALLBACK_FILE);
    if (cached) {
      return { ...cached, timestamp: new Date().toISOString() };
    }

    return {
      news: (await this.buildWslNews()).slice(0, 6),
      rankings: { men: [], women: [] },
      events: [],
      timestamp: new Date().toISOString(),
    };
  }
}
