import { Injectable } from '@nestjs/common';
import { NoticiasRegionaisRepository, RegionalNewsItem, TrafficRoute } from './noticias-regionais.repository';

@Injectable()
export class NoticiasRegionaisService {
  constructor(private readonly repo: NoticiasRegionaisRepository) {}

  getData() {
    return this.repo.getData();
  }

  getNewsByCategory(category: string): RegionalNewsItem[] {
    return this.repo.getNewsByCategory(category);
  }

  getRoutes(): TrafficRoute[] {
    return this.repo.getRoutes();
  }
}
