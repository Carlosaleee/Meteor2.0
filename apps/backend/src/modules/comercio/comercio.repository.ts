import { Injectable } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-comercio.json';

export type CommerceItem = {
  id: string;
  name: string;
  sector: string;
  subsector: string;
  lat: number;
  lon: number;
  address: string;
  description: string;
  phone: string;
  googleMapsUrl: string;
};

export type ComercioResponse = {
  commerce: CommerceItem[];
  timestamp: string;
};

@Injectable()
export class ComercioRepository {
  constructor(private readonly fallback: FallbackService) {}

  async getComercioData(): Promise<ComercioResponse> {
    const data = await this.fallback.load<{ commerce: CommerceItem[]; timestamp: string }>(FALLBACK_FILE);
    return {
      commerce: data?.commerce ?? [],
      timestamp: data?.timestamp ?? new Date().toISOString(),
    };
  }

  async getCommerceBySector(sector: string): Promise<CommerceItem[]> {
    const data = await this.getComercioData();
    return data.commerce.filter(c => c.sector === sector);
  }
}
