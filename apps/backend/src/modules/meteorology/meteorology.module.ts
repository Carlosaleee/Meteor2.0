import { Module } from '@nestjs/common';
import { MeteorologyController } from './meteorology.controller';
import { MeteorologyService } from './meteorology.service';
import { OpenMeteoRepository } from './open-meteo.repository';
import { WeatherNewsRepository } from './weather-news.repository';

@Module({
  controllers: [MeteorologyController],
  providers: [MeteorologyService, OpenMeteoRepository, WeatherNewsRepository],
  exports: [MeteorologyService, OpenMeteoRepository, WeatherNewsRepository],
})
export class MeteorologyModule {}
