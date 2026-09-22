import { Controller, Get, Query } from '@nestjs/common';
import { MeteorologyService } from './meteorology.service';
import { WeatherNewsRepository, WeatherNewsResponse } from './weather-news.repository';

@Controller('v1/meteorology')
export class MeteorologyController {
  constructor(
    private readonly meteorologyService: MeteorologyService,
    private readonly weatherNewsRepo: WeatherNewsRepository,
  ) {}

  @Get()
  async getWeather(@Query('locationId') locationId?: string) {
    const data = await this.meteorologyService.getCurrentWeather(locationId);
    return data;
  }

  @Get('news')
  async getWeatherNews(@Query('cityId') cityId?: string): Promise<WeatherNewsResponse> {
    return this.weatherNewsRepo.getWeatherNews(cityId);
  }
}
