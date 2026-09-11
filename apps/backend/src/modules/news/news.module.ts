import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsRepository } from './news.repository';
import { WslRepository } from './wsl.repository';
import { SpsurfRepository } from './spsurf.repository';

@Module({
  controllers: [NewsController],
  providers: [NewsService, NewsRepository, WslRepository, SpsurfRepository],
  exports: [NewsService],
})
export class NewsModule {}
