import { Controller, Get, Query } from '@nestjs/common';
import { LocalismoService } from './localismo.service';

@Controller('v1/localismo')
export class LocalismoController {
  constructor(private readonly localismoService: LocalismoService) {}

  @Get()
  async getLocalismo() {
    return this.localismoService.getLocalismoData();
  }

  @Get('commerce')
  async getCommerce(@Query('sector') sector?: string) {
    if (sector) {
      return this.localismoService.getCommerceBySector(sector);
    }
    return this.localismoService.getAllCommerce();
  }
}
