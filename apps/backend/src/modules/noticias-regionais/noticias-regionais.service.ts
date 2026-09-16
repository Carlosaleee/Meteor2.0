import { Injectable } from '@nestjs/common';
import { NoticiasRegionaisRepository, RegionalNewsItem, TrafficRoute } from './noticias-regionais.repository';

@Injectable()
export class NoticiasRegionaisService {
  constructor(private readonly repo: NoticiasRegionaisRepository) {}

  async getData() {
    return this.repo.getData();
  }

  async getNewsByCategory(category: string): Promise<RegionalNewsItem[]> {
    return this.repo.getNewsByCategory(category);
  }

  async getRoutes(): Promise<TrafficRoute[]> {
    return this.repo.getRoutes();
  }
}
