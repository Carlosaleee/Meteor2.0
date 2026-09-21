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

  private buildWslNews(): NewsItem[] {
    const now = new Date();
    return [
      {
        id: 'wsl-trestles-miguel-vence',
        title: 'Miguel Pupo vence Trestles e sobe para 4o do ranking mundial',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://ne9.com.br/wsl-trestles-miguel-pupo-erin-brooks-ranking/',
        description: 'Miguel Pupo derrotou Kanoa Igarashi na final por 14,77 a 14,40 em Lower Trestles. Segunda vitoria do brasileiro na temporada.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      },
      {
        id: 'wsl-yago-lideranca',
        title: 'Yago Dora assume lideranca do ranking WSL apos Trestles',
        source: 'ge Globo',
        sourceUrl: 'https://ge.globo.com/surfe/wsl/',
        url: 'https://ge.globo.com/surfe/wsl/noticia/2026/09/17/yago-dora-vai-as-quartas-de-final-de-trestles-e-mantem-lideranca-provisoria-da-wsl.ghtml',
        description: 'Atual campeao mundial vence duelo de aereos contra Kauli Vaast e assume 1a posicao com 42.780 pontos.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
      },
      {
        id: 'wsl-erin-tripla',
        title: 'Erin Brooks conquista 3o titulo consecutivo no CT feminino',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com',
        url: 'https://ne9.com.br/wsl-trestles-miguel-pupo-erin-brooks-ranking/',
        description: 'Canadense derrotou Gabriela Bryan na final por 13,00 a 11,90. Terceiro titulo consecutivo apos Taiti e Fiji.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      },
      {
        id: 'wsl-medina-eliminado',
        title: 'Medina e eliminado em Trestles e complica busca pelo tetra',
        source: 'UOL',
        sourceUrl: 'https://www.uol.com.br/esporte/',
        url: 'https://www.uol.com.br/esporte/colunas/guilherme-dorini/2026/09/17/eliminacao-precoce-de-medina-em-trestles-atrapalha-luta-pelo-tetra-mundial.htm',
        description: 'Tricampeao mundial cai para Mateus Herdy na segunda rodada (11,83 a 12,00). Ja tem 3 eliminacoes no Round 2 esta temporada.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
      },
      {
        id: 'wsl-trestles-corte',
        title: 'Trestles define corte do CT: 22 homens e 14 mulheres seguem',
        source: 'aos Midia',
        sourceUrl: 'https://aosmidia.com.br',
        url: 'https://aosmidia.com.br/2026/competicoes/wsl/miguel-pupo-vence-em-trestles-veja-ranking-e-corte/',
        description: 'Filipe Toledo escapou do corte. Mateus Herdy e Alejo Muniz ficam fora das proximas duas etapas do CT.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      },
      {
        id: 'wsl-portugal-proximo',
        title: 'MEO Rip Curl Pro Portugal: proxima parada do CT em Supertubos',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com/events',
        url: 'https://www.worldsurfleague.com/events',
        description: 'Decima etapa do CT 2026 em Peniche de 16 a 25 de outubro. Classificados pelo corte disputam penultima etapa.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
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
        id: 'wsl-fioravanti-cai',
        title: 'Fioravanti cai na estreia e abre disputa entre Yago e Italo',
        source: 'NSC Total',
        sourceUrl: 'https://www.nsctotal.com.br',
        url: 'https://www.nsctotal.com.br/esportes/reviravolta-no-ranking-da-wsl-coloca-yago-dora-na-lideranca-e-abre-espaco-para-trinca-brasileira-durante-ct-de-trestles',
        description: 'Lider do ranking foi eliminado por Luke Thompson na segunda rodada. Italiano somou apenas 6,90 pontos.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
      },
      {
        id: 'wsl-luana-top6',
        title: 'Luana Silva permanece entre as 6 melhores do ranking feminino',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com/athletes/rankings',
        url: 'https://www.worldsurfleague.com/athletes/rankings',
        description: 'Brasileira terminou entre as 5 melhores em Trestles e ocupa 6a posicao com 36.580 pontos.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
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
        publishedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
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
        publishedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
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
        publishedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      },
      {
        id: 'wsl-gabriela-lidera',
        title: 'Gabriela Bryan assume lideranca do ranking feminino apos Trestles',
        source: 'World Surf League',
        sourceUrl: 'https://www.worldsurfleague.com/athletes/rankings',
        url: 'https://www.worldsurfleague.com/athletes/rankings',
        description: 'Havaiana assume 1a posicao com 42.865 pontos apos final em Trestles. Erin Brooks sobe para 5a com 3 titulos seguidos.',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/05d0c45992d04a5409e4f0752d17382f.png?&x=1440&y=513&icq=74&sig=b95e55f8d4a05ce4133bcc58ba78e486',
        category: 'WSL',
        publishedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      },
    ];
  }

  private async getFallbackData(): Promise<NewsResponse> {
    const cached = await this.fallback.load<FallbackNewsData>(FALLBACK_FILE);
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
