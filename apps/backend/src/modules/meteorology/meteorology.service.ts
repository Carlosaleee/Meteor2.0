import { Injectable } from '@nestjs/common';
import { OpenMeteoRepository } from './open-meteo.repository';

@Injectable()
export class MeteorologyService {
  constructor(private readonly openMeteoRepo: OpenMeteoRepository) {}

  async getCurrentWeather(locationId = 'ilha-comprida') {
    // Coordenadas padrão de Ilha Comprida / Vale do Ribeira
    const coords: Record<string, { lat: number; lon: number; name: string }> = {
      'ilha-comprida': { lat: -24.73, lon: -47.55, name: 'Ilha Comprida' },
      'iguape': { lat: -24.70, lon: -47.55, name: 'Iguape' },
      'cananeia': { lat: -25.01, lon: -47.92, name: 'Cananéia' },
      'registro': { lat: -24.48, lon: -47.84, name: 'Registro' },
    };

    const loc = coords[locationId] || coords['ilha-comprida'];
    const current = await this.openMeteoRepo.getAtmosphereData(loc.lat, loc.lon);

    return {
      location: loc.name,
      timestamp: new Date().toISOString(),
      current: {
        temperature: current.temperature_2m ?? 26,
        apparentTemperature: current.apparent_temperature ?? 28,
        humidity: current.relative_humidity_2m ?? 78,
        windSpeed: current.wind_speed_10m ?? 18,
        windDirection: current.wind_direction_10m ?? 140,
        pressure: current.surface_pressure ?? 1014,
        precipitation: current.precipitation ?? 0,
      },
      forecastMax: 29,
      forecastMin: 21,
      condition: 'Parcialmente Nublado / Costeiro',
    };
  }
}
