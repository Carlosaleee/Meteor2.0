import { Module } from '@nestjs/common';
import { NoticiasRegionaisController } from './noticias-regionais.controller';
import { NoticiasRegionaisService } from './noticias-regionais.service';
import { NoticiasRegionaisRepository } from './noticias-regionais.repository';
import { FallbackModule } from '../../common/fallback/fallback.module';

@Module({
  imports: [FallbackModule],
  controllers: [NoticiasRegionaisController],
  providers: [NoticiasRegionaisService, NoticiasRegionaisRepository],
  exports: [NoticiasRegionaisService, NoticiasRegionaisRepository],
})
export class NoticiasRegionaisModule {}
