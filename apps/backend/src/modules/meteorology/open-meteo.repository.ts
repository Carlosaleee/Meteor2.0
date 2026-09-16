import { Injectable, Logger } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-meteorology.json';

export type CurrentData = {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  surface_pressure: number;
};

export type HourlyData = {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  cloud_cover: number[];
  visibility: number[];
};

export type DailyData = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  weather_code: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
};

export type AtmosphereData = {
  current: CurrentData;
  hourly: HourlyData;
  daily: DailyData;
};

@Injectable()
export class OpenMeteoRepository {
  private readonly logger = new Logger(OpenMeteoRepository.name);

  constructor(private readonly fallback: FallbackService) {}

  async getAtmosphereData(lat: number, lon: number, locationId: string): Promise<AtmosphereData> {
    const { data: cached, isStale } = await this.fallback.loadWithTimestamp<{
      locations: Record<string, AtmosphereData>;
    }>(FALLBACK_FILE);

    if (!isStale && cached?.locations?.[locationId]) {
      this.logger.debug(`Using fresh fallback for ${locationId}`);
      return cached.locations[locationId];
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
        + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure`
        + `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,cloud_cover,visibility`
        + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code,sunrise,sunset,uv_index_max`
        + `&forecast_days=7&timezone=America/Sao_Paulo`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
      const data = await res.json();

      if (!data.current || typeof data.current.temperature_2m !== 'number') {
        throw new Error('Open-Meteo returned invalid current data');
      }

      const result: AtmosphereData = {
        current: data.current as CurrentData,
        hourly: data.hourly as HourlyData,
        daily: data.daily as DailyData,
      };

      this.saveFallback(locationId, result);
      this.logger.log(`Fresh data for ${locationId}: temp=${data.current.temperature_2m}°C, precip=${data.current.precipitation}mm`);
      return result;
    } catch (err) {
      this.logger.warn(`Open-Meteo API failed for ${locationId}: ${err}`);
    }

    if (cached?.locations?.[locationId]) {
      this.logger.warn(`Using stale fallback for ${locationId}`);
      return cached.locations[locationId];
    }

    this.logger.warn(`No cached data for ${locationId}, using defaults`);
    return this.getDefault(locationId);
  }

  private async saveFallback(locationId: string, data: AtmosphereData): Promise<void> {
    const existing = await this.fallback.load<{ locations: Record<string, AtmosphereData> }>(FALLBACK_FILE);
    const locations = existing?.locations ?? {};
    locations[locationId] = data;
    await this.fallback.save(FALLBACK_FILE, { locations });
  }

  private getDefault(locationId: string): AtmosphereData {
    const now = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now);
      d.setHours(d.getHours() + i);
      return d.toISOString().slice(0, 16);
    });
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });

    const defaults: Record<string, CurrentData> = {
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

    const current = defaults[locationId] ?? defaults['ilha-comprida'];

    return {
      current,
      hourly: {
        time: hours,
        temperature_2m: hours.map(() => current.temperature_2m + (Math.random() * 4 - 2)),
        relative_humidity_2m: hours.map(() => Math.min(100, Math.max(30, current.relative_humidity_2m + (Math.random() * 20 - 10)))),
        precipitation_probability: hours.map(() => Math.round(Math.random() * 60)),
        precipitation: hours.map(() => +(Math.random() * 2).toFixed(1)),
        weather_code: hours.map(() => current.weather_code),
        wind_speed_10m: hours.map(() => +(current.wind_speed_10m + (Math.random() * 6 - 3)).toFixed(1)),
        cloud_cover: hours.map(() => Math.round(Math.random() * 80 + 10)),
        visibility: hours.map(() => Math.round(8000 + Math.random() * 12000)),
      },
      daily: {
        time: days,
        temperature_2m_max: days.map(() => +(current.temperature_2m + 4 + Math.random() * 3).toFixed(1)),
        temperature_2m_min: days.map(() => +(current.temperature_2m - 4 - Math.random() * 2).toFixed(1)),
        precipitation_sum: days.map(() => +(Math.random() * 15).toFixed(1)),
        precipitation_probability_max: days.map(() => Math.round(Math.random() * 80)),
        wind_speed_10m_max: days.map(() => +(current.wind_speed_10m + Math.random() * 10).toFixed(1)),
        weather_code: days.map(() => current.weather_code),
        sunrise: days.map(d => `${d}T06:15`),
        sunset: days.map(d => `${d}T18:05`),
        uv_index_max: days.map(() => +(Math.random() * 8 + 2).toFixed(1)),
      },
    };
  }
}
