import { Injectable, Logger } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-oceanography.json';

type MarineData = {
  wave_height: number;
  wave_period: number;
  wave_direction: number;
  swell_wave_height: number;
  swell_wave_period: number;
  swell_wave_direction: number;
};

@Injectable()
export class MarineRepository {
  private readonly logger = new Logger(MarineRepository.name);

  constructor(private readonly fallback: FallbackService) {}

  async getMarineData(lat: number, lon: number): Promise<MarineData> {
    const { data: cached, isStale } = this.fallback.loadWithTimestamp<{ current: MarineData }>(FALLBACK_FILE);

    if (!isStale && cached?.current) {
      this.logger.debug('Using fresh fallback for oceanography');
      return cached.current;
    }

    try {
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&timezone=America/Sao_Paulo`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Open-Meteo Marine returned ${res.status}`);
      const data = await res.json();
      const current = data.current as MarineData | undefined;

      if (current) {
        this.saveFallback(current);
        return current;
      }
    } catch (err) {
      this.logger.warn(`Open-Meteo Marine API failed: ${err}`);
    }

    if (cached?.current) {
      this.logger.warn('Using stale fallback for oceanography');
      return cached.current;
    }

    return this.getDefault();
  }

  private saveFallback(current: MarineData): void {
    this.fallback.save(FALLBACK_FILE, { current });
  }

  private getDefault(): MarineData {
    return {
      wave_height: 1.1,
      wave_period: 9,
      wave_direction: 145,
      swell_wave_height: 0.9,
      swell_wave_period: 10,
      swell_wave_direction: 138,
    };
  }
}
