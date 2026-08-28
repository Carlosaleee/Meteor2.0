import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { ZodValidationPipe } from "../../common/http/zod-validation.pipe";
import { forecastQuerySchema, type ForecastQueryDto } from "./dto/forecast-query.dto";
import { ForecastService } from "./forecast.service";

@Controller("v1")
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get("locations")
  listLocations() {
    return this.forecastService.listLocations();
  }

  @Get("forecast")
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120 * 1000)
  getForecast(
    @Query(new ZodValidationPipe(forecastQuerySchema)) query: ForecastQueryDto,
  ) {
    return this.forecastService.getForecast(query);
  }
}
