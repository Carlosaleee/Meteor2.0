import { Injectable } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-localismo.json';

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

export type LocalismoResponse = {
  commerce: CommerceItem[];
  timestamp: string;
};

@Injectable()
export class LocalismoRepository {
  constructor(private readonly fallback: FallbackService) {}

  getLocalismoData(): LocalismoResponse {
    const data = this.fallback.load<{ commerce: CommerceItem[]; timestamp: string }>(FALLBACK_FILE);
    return {
      commerce: data?.commerce ?? [],
      timestamp: data?.timestamp ?? new Date().toISOString(),
    };
  }

  getCommerceBySector(sector: string): CommerceItem[] {
    const data = this.getLocalismoData();
    return data.commerce.filter(c => c.sector === sector);
  }
}
