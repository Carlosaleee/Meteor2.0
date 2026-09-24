import { Module } from '@nestjs/common';
import { RefreshService } from './refresh.service';
import { CronController } from './cron.controller';
import { MeteorologyModule } from '../../modules/meteorology/meteorology.module';
import { OceanographyModule } from '../../modules/oceanography/oceanography.module';
import { NewsModule } from '../../modules/news/news.module';
import { NoticiasRegionaisModule } from '../../modules/noticias-regionais/noticias-regionais.module';

@Module({
  imports: [MeteorologyModule, OceanographyModule, NewsModule, NoticiasRegionaisModule],
  controllers: [CronController],
  providers: [RefreshService],
  exports: [RefreshService],
})
export class RefreshModule {}
