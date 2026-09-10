import { Injectable } from '@nestjs/common';
import { OpenMeteoRepository } from './open-meteo.repository';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-meteorology.json';

@Injectable()
export class MeteorologyService {
  constructor(
    private readonly openMeteoRepo: OpenMeteoRepository,
    private readonly fallback: FallbackService,
  ) {}

  async getCurrentWeather(locationId = 'ilha-comprida') {
    const coords: Record<string, { lat: number; lon: number; name: string }> = {
      'ilha-comprida': { lat: -24.73, lon: -47.55, name: 'Ilha Comprida' },
      'iguape': { lat: -24.70, lon: -47.55, name: 'Iguape' },
      'cananeia': { lat: -25.01, lon: -47.92, name: 'Cananéia' },
      'registro': { lat: -24.48, lon: -47.84, name: 'Registro' },
    };

    const loc = coords[locationId] || coords['ilha-comprida'];
    const current = await this.openMeteoRepo.getAtmosphereData(loc.lat, loc.lon, locationId);

    const fallbackData = this.fallback.load<{
      locations: Record<string, { forecast: { max: number; min: number } }>;
    }>(FALLBACK_FILE);
    const forecast = fallbackData?.locations?.[locationId]?.forecast ?? { max: 24, min: 17 };

    return {
      location: loc.name,
      locationId,
      timestamp: new Date().toISOString(),
      current: {
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        pressure: current.surface_pressure,
        precipitation: current.precipitation,
        weatherCode: current.weather_code,
      },
      forecastMax: forecast.max,
      forecastMin: forecast.min,
    };
  }
}
