import { Controller, Get } from '@nestjs/common';
import { OceanographyService } from './oceanography.service';

@Controller('v1/oceanography')
export class OceanographyController {
  constructor(private readonly oceanographyService: OceanographyService) {}

  @Get()
  async getSwell() {
    return await this.oceanographyService.getSwellConditions();
  }

  @Get('hourly')
  async getHourly() {
    return await this.oceanographyService.getHourlyForecast();
  }

  @Get('summary')
  async getSummary() {
    return await this.oceanographyService.getAiSummary();
  }
}
