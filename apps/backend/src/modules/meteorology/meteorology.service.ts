import { Injectable } from '@nestjs/common';
import { OpenMeteoRepository } from './open-meteo.repository';

@Injectable()
export class MeteorologyService {
  constructor(private readonly openMeteoRepo: OpenMeteoRepository) {}

  async getCurrentWeather(locationId = 'ilha-comprida') {
    const coords: Record<string, { lat: number; lon: number; name: string }> = {
      'ilha-comprida': { lat: -24.73, lon: -47.55, name: 'Ilha Comprida' },
      'iguape': { lat: -24.70, lon: -47.55, name: 'Iguape' },
      'cananeia': { lat: -25.01, lon: -47.92, name: 'Cananéia' },
      'registro': { lat: -24.48, lon: -47.84, name: 'Registro' },
    };

    const loc = coords[locationId] || coords['ilha-comprida'];
    const raw = await this.openMeteoRepo.getAtmosphereData(loc.lat, loc.lon, locationId);

    const current = raw.current;
    const hourly = raw.hourly;
    const daily = raw.daily;

    const now = new Date();

    const hasHourly = hourly?.time?.length > 0;
    const hasDaily = daily?.time?.length > 0;

    let startIdx = 0;
    if (hasHourly) {
      const currentHourIndex = hourly.time.findIndex(t => {
        const d = new Date(t);
        return d.getHours() === now.getHours();
      });
      startIdx = Math.max(0, currentHourIndex >= 0 ? currentHourIndex : 0);
    }

    return {
      location: loc.name,
      locationId,
      timestamp: now.toISOString(),
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
      hourly: hasHourly
        ? hourly.time.slice(startIdx, startIdx + 24).map((time, i) => ({
            time,
            temperature: hourly.temperature_2m[startIdx + i],
            humidity: hourly.relative_humidity_2m[startIdx + i],
            precipitationProbability: hourly.precipitation_probability[startIdx + i],
            precipitation: hourly.precipitation[startIdx + i],
            weatherCode: hourly.weather_code[startIdx + i],
            windSpeed: hourly.wind_speed_10m[startIdx + i],
            cloudCover: hourly.cloud_cover[startIdx + i],
            visibility: hourly.visibility[startIdx + i],
          }))
        : [],
      daily: hasDaily
        ? daily.time.map((date, i) => ({
            date,
            tempMax: daily.temperature_2m_max[i],
            tempMin: daily.temperature_2m_min[i],
            precipitationSum: daily.precipitation_sum[i],
            precipitationProbabilityMax: daily.precipitation_probability_max[i],
            windSpeedMax: daily.wind_speed_10m_max[i],
            weatherCode: daily.weather_code[i],
            sunrise: daily.sunrise[i],
            sunset: daily.sunset[i],
            uvIndexMax: daily.uv_index_max[i],
          }))
        : [],
    };
  }
}
