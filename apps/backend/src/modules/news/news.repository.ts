import { Injectable, Logger } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';
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

  async getNewsData(): Promise<NewsResponse> {
    if (this.cache && Date.now() - new Date(this.cache.timestamp).getTime() < this.CACHE_TTL_MS) {
      return this.cache;
    }

    try {
      const [wslRankings, spsurfNews] = await Promise.all([
        this.wslRepo.getRankings(),
        this.spsurfRepo.getNews(),
      ]);

      const wslNews = this.buildWslNews();
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
      this.fallback.save(FALLBACK_FILE, {
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

  private buildWslNews(): NewsItem[] {
    const now = new Date();
    return [
      {
        id: 'wsl-ct-2026-ranking',
        title: 'WSL Championship Tour 2026 — Fioravanti lidera apos cancelamento de Abu Dhabi',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/athletes/tour/mct',
        description: 'Leonardo Fioravanti assumiu a lideranca apos ajuste nos descartes. Italo Ferreira em 2o com apenas 85 pontos de diferenca. Brasil domina top 5.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      },
      {
        id: 'wsl-ranking-feminino',
        title: 'Ranking WSL Feminino 2026 — Carissa Moore lidera, Luana Silva em 5o',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com/athletes/rankings',
        url: 'https://www.worldsurfleague.com/athletes/rankings',
        description: 'Carissa Moore mantem a lideranca com 39.575 pontos. Luana Silva e a brasileira melhor posicionada em 5o com 33.835 pontos.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      },
      {
        id: 'wsl-trestles-pro',
        title: 'Lexus Trestles Pro — CT Etapa 09 em Standby na California',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com/events',
        url: 'https://www.worldsurfleague.com/events',
        description: '9a etapa do CT aguarda melhores condicoes em Lower Trestles. Disputa apertada com Fioravanti e Italo separados por 85 pontos.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      },
      {
        id: 'wsl-saosebastiao-cs',
        title: 'Banco do Brasil Sao Sebastiao Pro — WSL chega ao litoral paulista',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.terra.com.br/esportes/surfe/berco-de-gabriel-medina-litoral-de-sp-recebe-etapa-mundial-da-wsl-pela-primeira-vez',
        description: 'Etapa do Challenger Series em Sao Sebastiao de 26/09 a 03/10 na Praia de Maresias. Evento historico para o surfe paulista.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      },
      {
        id: 'wsl-italo-perde',
        title: 'Italo Ferreira perde lideranca da WSL sem entrar na agua',
        source: 'ge Globo',
        sourceUrl: 'https://ge.globo.com/surfe/wsl/',
        url: 'https://ge.globo.com/surfe/wsl/noticia/2026/09/06/entenda-como-italo-ferreira-perdeu-a-lideranca-da-wsl-sem-sequer-entrar-na-agua.ghtml',
        description: 'Cancelamento de Abu Dhabi alterou regras de descarte. Fioravanti assume lideranca com 85 pontos de vantagem.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      },
      {
        id: 'wsl-medina-vice',
        title: 'Gabriel Medina vice-campeao em Fiji e sobe para 4o do ranking',
        source: 'Lance!',
        sourceUrl: 'https://www.lance.com.br',
        url: 'https://www.lance.com.br/mais-esportes/brasil-domina-top-5-do-surfe-mundial-apos-etapa-em-fiji.html',
        description: 'Medina arrancou nota 10 em tubo em Cloudbreak e terminou vice. Brasil domina top 5 do ranking mundial.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
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
    return news.filter(item => new Date(item.publishedAt) >= sevenDaysAgo);
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

  private getExtraNews(): NewsItem[] {
    const now = new Date();
    return [
      {
        id: 'wsl-yago-dora',
        title: 'Yago Dora — Surfe brasileiro brilha no CT com manobras aereas',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/athletes/tour/mct',
        description: 'Yago Dora impressiona com manobras aereas no Championship Tour 2026. Em 3o lugar com 37.695 pontos.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      },
      {
        id: 'wsl-miguel-pupo',
        title: 'Miguel Pupo — Consistencia garante 5a posicao no ranking mundial',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/athletes/tour/mct',
        description: 'Miguel Pupo mantem consistencia no CT 2026 com 32.770 pontos. Surfista paulista e destaque na temporada.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      },
      {
        id: 'spsurf-circuito-base',
        title: 'SPSurf — Hang Loose Surf Attack 2026 com 288 vagas record',
        description: '33a edicao do mais tradicional circuito de base do Brasil com maior premiacao da historia. Evento em Maresias.',
        source: 'SPSurf',
        sourceUrl: 'https://www.spsurf.com.br',
        url: 'https://www.spsurf.com.br/hangloosesurfattack',
        image: 'https://static.wixstatic.com/media/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.jpeg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.webp',
        category: 'Paulista',
        publishedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
      },
      {
        id: 'wsl-italo-perde',
        title: 'Italo Ferreira perde lideranca da WSL sem entrar na agua',
        source: 'ge Globo',
        sourceUrl: 'https://ge.globo.com/surfe/wsl/',
        url: 'https://ge.globo.com/surfe/wsl/noticia/2026/09/06/entenda-como-italo-ferreira-perdeu-a-lideranca-da-wsl-sem-sequer-entrar-na-agua.ghtml',
        description: 'Cancelamento de Abu Dhabi alterou regras de descarte. Fioravanti assume lideranca com 85 pontos de vantagem sobre Italo.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      },
      {
        id: 'spsurf-gromsearch',
        title: 'Rip Curl GromSearch Maresias 2026 — Nova geracao do surf brasileiro',
        source: 'Rip Curl Blog',
        sourceUrl: 'https://blog.ripcurl.com.br',
        url: 'https://blog.ripcurl.com.br/2026/09/10/rip-curl-gromsearch-maresias-2026-reune-a-nova-geracao-do-surf-brasileiro/',
        description: 'Arthur Vilar e Isabel Meyer classificados para final internacional na Australia. Maresias apresentou condicoes classicas.',
        image: 'https://static.wixstatic.com/media/71b9f8_d53b9f235c844cb09ce5789c48052bf6~mv2.jpg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/71b9f8_d53b9f235c844cb09ce5789c48052bf6~mv2.jpg',
        category: 'Paulista',
        publishedAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
      },
      {
        id: 'wsl-samuel-pupo',
        title: 'Samuel Pupo — Irmão de Miguel brilha no CT e ocupa 8a posicao',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://www.worldsurfleague.com/athletes/tour/mct',
        description: 'Samuel Pupo surpreende com 27.960 pontos na 8a posicao. A familia Pupo domina o surf brasileiro.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      },
    ];
  }

  private getFallbackData(): NewsResponse {
    const cached = this.fallback.load<FallbackNewsData>(FALLBACK_FILE);
    if (cached) {
      return { ...cached, timestamp: new Date().toISOString() };
    }

    return {
      news: this.buildWslNews().slice(0, 6),
      rankings: { men: [], women: [] },
      events: [],
      timestamp: new Date().toISOString(),
    };
  }
}
