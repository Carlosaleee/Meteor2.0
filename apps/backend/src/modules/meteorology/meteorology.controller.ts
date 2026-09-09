import { Controller, Get, Query } from '@nestjs/common';
import { MeteorologyService } from './meteorology.service';

@Controller('v1/meteorology')
export class MeteorologyController {
  constructor(private readonly meteorologyService: MeteorologyService) {}

  @Get()
  async getWeather(@Query('locationId') locationId?: string) {
    const data = await this.meteorologyService.getCurrentWeather(locationId);
    return data;
  }
}
