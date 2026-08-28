import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ForecastController } from "./forecast.controller";
import { ForecastService } from "./forecast.service";
import { InmetRepository } from "./repositories/inmet.repository";
import { OpenMeteoMarineRepository } from "./repositories/open-meteo-marine.repository";
import { OpenMeteoRepository } from "./repositories/open-meteo.repository";
import { StormglassRepository } from "./repositories/stormglass.repository";

@Module({
  imports: [CacheModule.register({ ttl: 120 * 1000 })],
  controllers: [ForecastController],
  providers: [
    ForecastService,
    OpenMeteoRepository,
    OpenMeteoMarineRepository,
    StormglassRepository,
    InmetRepository,
  ],
  exports: [ForecastService],
})
export class ForecastModule {}
