import { Controller, Get, Query } from '@nestjs/common';
import { NoticiasRegionaisService } from './noticias-regionais.service';

@Controller('v1/noticias-regionais')
export class NoticiasRegionaisController {
  constructor(private readonly service: NoticiasRegionaisService) {}

  @Get()
  getData() {
    return this.service.getData();
  }

  @Get('news')
  getNews(@Query('category') category?: string) {
    return this.service.getNewsByCategory(category ?? 'todas');
  }

  @Get('routes')
  getRoutes() {
    return this.service.getRoutes();
  }
}
