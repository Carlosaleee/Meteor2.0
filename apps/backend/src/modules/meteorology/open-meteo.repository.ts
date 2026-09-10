import { Injectable, Logger } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-meteorology.json';

type AtmosphereData = {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  surface_pressure: number;
};

@Injectable()
export class OpenMeteoRepository {
  private readonly logger = new Logger(OpenMeteoRepository.name);

  constructor(private readonly fallback: FallbackService) {}

  async getAtmosphereData(lat: number, lon: number, locationId: string): Promise<AtmosphereData> {
    const { data: cached, isStale } = this.fallback.loadWithTimestamp<{
      locations: Record<string, { current: AtmosphereData }>;
    }>(FALLBACK_FILE);

    if (!isStale && cached?.locations?.[locationId]?.current) {
      this.logger.debug(`Using fresh fallback for ${locationId}`);
      return cached.locations[locationId].current;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=America/Sao_Paulo`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
      const data = await res.json();
      const current = data.current as AtmosphereData | undefined;

      if (current) {
        this.saveFallback(locationId, current);
        return current;
      }
    } catch (err) {
      this.logger.warn(`Open-Meteo API failed for ${locationId}: ${err}`);
    }

    if (cached?.locations?.[locationId]?.current) {
      this.logger.warn(`Using stale fallback for ${locationId}`);
      return cached.locations[locationId].current;
    }

    return this.getDefault(locationId);
  }

  private saveFallback(locationId: string, current: AtmosphereData): void {
    const existing = this.fallback.load<{ locations: Record<string, { current: AtmosphereData }> }>(FALLBACK_FILE);
    const locations = existing?.locations ?? {};
    locations[locationId] = { current };
    this.fallback.save(FALLBACK_FILE, { locations });
  }

  private getDefault(locationId: string): AtmosphereData {
    const defaults: Record<string, AtmosphereData> = {
      'ilha-comprida': {
        temperature_2m: 21.5, relative_humidity_2m: 82, apparent_temperature: 20.8,
        precipitation: 0, weather_code: 2, wind_speed_10m: 14.3,
        wind_direction_10m: 110, surface_pressure: 1018.2,
      },
      'iguape': {
        temperature_2m: 22.0, relative_humidity_2m: 80, apparent_temperature: 21.2,
        precipitation: 0, weather_code: 2, wind_speed_10m: 12.8,
        wind_direction_10m: 105, surface_pressure: 1017.9,
      },
      'cananeia': {
        temperature_2m: 20.8, relative_humidity_2m: 85, apparent_temperature: 20.1,
        precipitation: 0.2, weather_code: 3, wind_speed_10m: 16.1,
        wind_direction_10m: 120, surface_pressure: 1018.5,
      },
      'registro': {
        temperature_2m: 23.2, relative_humidity_2m: 75, apparent_temperature: 22.5,
        precipitation: 0, weather_code: 1, wind_speed_10m: 10.5,
        wind_direction_10m: 90, surface_pressure: 1017.0,
      },
    };
    return defaults[locationId] ?? defaults['ilha-comprida'];
  }
}
