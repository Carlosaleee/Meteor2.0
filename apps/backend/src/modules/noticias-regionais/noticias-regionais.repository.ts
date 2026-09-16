import { Injectable } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-noticias-regionais.json';

export type RegionalNewsItem = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  url: string;
  description: string;
  image: string;
  category: 'noticia' | 'transito' | 'policial' | 'turismo' | 'cotidiano';
  publishedAt: string;
};

export type TrafficRoute = {
  id: string;
  name: string;
  condition: string;
  description: string;
  updatedAt: string;
};

export type RegionalNewsResponse = {
  news: RegionalNewsItem[];
  routes: TrafficRoute[];
  timestamp: string;
};

@Injectable()
export class NoticiasRegionaisRepository {
  constructor(private readonly fallback: FallbackService) {}

  async getData(): Promise<RegionalNewsResponse> {
    const data = await this.fallback.load<{ news: RegionalNewsItem[]; routes: TrafficRoute[] }>(FALLBACK_FILE);
    return {
      news: data?.news ?? [],
      routes: data?.routes ?? [],
      timestamp: new Date().toISOString(),
    };
  }

  async getNewsByCategory(category: string): Promise<RegionalNewsItem[]> {
    const data = await this.getData();
    if (category === 'todas') return data.news;
    return data.news.filter(n => n.category === category);
  }

  async getRoutes(): Promise<TrafficRoute[]> {
    const data = await this.getData();
    return data.routes;
  }
}
