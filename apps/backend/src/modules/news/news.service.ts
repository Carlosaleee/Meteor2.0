import { Injectable } from '@nestjs/common';
import { NewsRepository, NewsResponse } from './news.repository';

@Injectable()
export class NewsService {
  constructor(private readonly newsRepo: NewsRepository) {}

  async getNews(): Promise<NewsResponse> {
    return this.newsRepo.getNewsData();
  }
}
