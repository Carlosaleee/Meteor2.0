import { Controller, Get } from '@nestjs/common';
import { OceanographyService } from './oceanography.service';

@Controller('v1/oceanography')
export class OceanographyController {
  constructor(private readonly oceanographyService: OceanographyService) {}

  @Get()
  async getSwell() {
    return await this.oceanographyService.getSwellConditions();
  }
}
