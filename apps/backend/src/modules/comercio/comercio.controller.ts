import { Controller, Get, Query } from '@nestjs/common';
import { ComercioService } from './comercio.service';

@Controller('v1/comercio')
export class ComercioController {
  constructor(private readonly comercioService: ComercioService) {}

  @Get()
  async getComercio() {
    return this.comercioService.getComercioData();
  }

  @Get('commerce')
  async getCommerce(@Query('sector') sector?: string) {
    if (sector) {
      return this.comercioService.getCommerceBySector(sector);
    }
    return this.comercioService.getAllCommerce();
  }
}
