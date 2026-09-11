import { Controller, Get } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('v1/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getNews() {
    return await this.newsService.getNews();
  }
}
