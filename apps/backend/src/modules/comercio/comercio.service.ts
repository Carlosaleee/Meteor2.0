import { Injectable } from '@nestjs/common';
import { ComercioRepository } from './comercio.repository';

@Injectable()
export class ComercioService {
  constructor(private readonly comercioRepo: ComercioRepository) {}

  async getComercioData() {
    return this.comercioRepo.getComercioData();
  }

  async getAllCommerce() {
    const data = await this.comercioRepo.getComercioData();
    return data.commerce;
  }

  async getCommerceBySector(sector: string) {
    return this.comercioRepo.getCommerceBySector(sector);
  }
}
