import { Injectable } from '@nestjs/common';
import { LocalismoRepository } from './localismo.repository';

@Injectable()
export class LocalismoService {
  constructor(private readonly localismoRepo: LocalismoRepository) {}

  getLocalismoData() {
    return this.localismoRepo.getLocalismoData();
  }

  getAllCommerce() {
    const data = this.localismoRepo.getLocalismoData();
    return data.commerce;
  }

  getCommerceBySector(sector: string) {
    return this.localismoRepo.getCommerceBySector(sector);
  }
}
