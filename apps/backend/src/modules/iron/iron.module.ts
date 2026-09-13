import { Module } from '@nestjs/common';
import { IronController } from './iron.controller';
import { IronService } from './iron.service';
import { MeteorologyModule } from '../meteorology/meteorology.module';
import { OceanographyModule } from '../oceanography/oceanography.module';
import { TrafficModule } from '../traffic/traffic.module';
import { ComercioModule } from '../comercio/comercio.module';
import { NoticiasRegionaisModule } from '../noticias-regionais/noticias-regionais.module';

@Module({
  imports: [
    MeteorologyModule,
    OceanographyModule,
    TrafficModule,
    ComercioModule,
    NoticiasRegionaisModule,
  ],
  controllers: [IronController],
  providers: [IronService],
  exports: [IronService],
})
export class IronModule {}
