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
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
};

export type HourlyMarineData = {
  time: string;
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
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
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=America/Sao_Paulo`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Open-Meteo Marine returned ${res.status}`);
      const data = await res.json();
      const raw = data.current as MarineData | undefined;

      if (raw) {
        const current: MarineData = {
          ...raw,
          wind_speed_10m: raw.wind_speed_10m ?? 12,
          wind_direction_10m: raw.wind_direction_10m ?? 180,
          wind_gusts_10m: raw.wind_gusts_10m ?? 18,
        };
        this.saveFallback(current);
        this.logger.log(`Marine data: wave=${current.wave_height}m, wind=${current.wind_speed_10m}km/h`);
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

  async getHourlyData(lat: number, lon: number): Promise<HourlyMarineData[]> {
    try {
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=America/Sao_Paulo&forecast_days=2`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Open-Meteo Marine hourly returned ${res.status}`);
      const data = await res.json();

      const hourly = data.hourly as {
        time: string[];
        wave_height: number[];
        wave_period: number[];
        wave_direction: number[];
        swell_wave_height: number[];
        swell_wave_period: number[];
        swell_wave_direction: number[];
        wind_speed_10m: number[];
        wind_direction_10m: number[];
        wind_gusts_10m: number[];
      } | undefined;

      if (!hourly?.time) return this.getDefaultHourly();

      const now = new Date();
      const result: HourlyMarineData[] = [];
      for (let i = 0; i < hourly.time.length && result.length < 12; i++) {
        const t = new Date(hourly.time[i]);
        if (t < now) continue;
        const windSpeed = hourly.wind_speed_10m[i];
        const windDir = hourly.wind_direction_10m[i];
        const windGust = hourly.wind_gusts_10m[i];
        result.push({
          time: hourly.time[i],
          waveHeight: hourly.wave_height[i] ?? 0,
          wavePeriod: hourly.wave_period[i] ?? 0,
          waveDirection: hourly.wave_direction[i] ?? 0,
          swellHeight: hourly.swell_wave_height[i] ?? 0,
          swellPeriod: hourly.swell_wave_period[i] ?? 0,
          swellDirection: hourly.swell_wave_direction[i] ?? 0,
          windSpeed: windSpeed ?? 12,
          windDirection: windDir ?? 180,
          windGust: windGust ?? 18,
        });
      }
      return result;
    } catch (err) {
      this.logger.warn(`Open-Meteo Marine hourly failed: ${err}`);
      return this.getDefaultHourly();
    }
  }

  private saveFallback(current: MarineData): void {
    const existing = this.fallback.load<{ current?: MarineData; quality?: unknown; tides?: unknown; spots?: unknown }>(FALLBACK_FILE);
    this.fallback.save(FALLBACK_FILE, {
      current,
      quality: existing?.quality,
      tides: existing?.tides,
      spots: existing?.spots,
    });
  }

  private getDefault(): MarineData {
    return {
      wave_height: 1.1,
      wave_period: 9,
      wave_direction: 145,
      swell_wave_height: 0.9,
      swell_wave_period: 10,
      swell_wave_direction: 138,
      wind_speed_10m: 12,
      wind_direction_10m: 180,
      wind_gusts_10m: 18,
    };
  }

  private getDefaultHourly(): HourlyMarineData[] {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const t = new Date(now.getTime() + (i + 1) * 3600_000);
      return {
        time: t.toISOString().slice(0, 16),
        waveHeight: 0.8 + Math.sin(i / 4) * 0.4,
        wavePeriod: 8 + Math.sin(i / 3) * 2,
        waveDirection: 140 + Math.sin(i / 5) * 20,
        swellHeight: 0.6 + Math.sin(i / 4) * 0.3,
        swellPeriod: 9 + Math.sin(i / 3) * 1.5,
        swellDirection: 135 + Math.sin(i / 5) * 15,
        windSpeed: 10 + Math.sin(i / 3) * 5,
        windDirection: 170 + Math.sin(i / 4) * 30,
        windGust: 15 + Math.sin(i / 3) * 8,
      };
    });
  }
}
