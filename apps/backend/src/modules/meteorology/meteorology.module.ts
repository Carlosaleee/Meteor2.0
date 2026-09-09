import { Module } from '@nestjs/common';
import { MeteorologyController } from './meteorology.controller';
import { MeteorologyService } from './meteorology.service';
import { OpenMeteoRepository } from './open-meteo.repository';

@Module({
  controllers: [MeteorologyController],
  providers: [MeteorologyService, OpenMeteoRepository],
  exports: [MeteorologyService],
})
export class MeteorologyModule {}
