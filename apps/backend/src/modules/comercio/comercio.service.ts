import { Injectable } from '@nestjs/common';
import { ComercioRepository } from './comercio.repository';

@Injectable()
export class ComercioService {
  constructor(private readonly comercioRepo: ComercioRepository) {}

  getComercioData() {
    return this.comercioRepo.getComercioData();
  }

  getAllCommerce() {
    const data = this.comercioRepo.getComercioData();
    return data.commerce;
  }

  getCommerceBySector(sector: string) {
    return this.comercioRepo.getCommerceBySector(sector);
  }
}
