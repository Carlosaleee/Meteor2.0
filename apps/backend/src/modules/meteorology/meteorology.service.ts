import { Injectable } from '@nestjs/common';
import { OpenMeteoRepository } from './open-meteo.repository';
import { spNowKey, hourKeyFromNaive } from '../../common/time/sp-time';

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
      // Os timestamps do Open-Meteo sao "wall clock" de SP. Comparar com getHours()
      // do processo (UTC na Vercel) desalinhava 3h — usar a hora atual em SP.
      const nowKey = spNowKey(now);
      const currentHourIndex = hourly.time.findIndex(t => hourKeyFromNaive(t) === nowKey);
      startIdx = Math.max(0, currentHourIndex >= 0 ? currentHourIndex : 0);
    }

    return {
      location: loc.name,
      locationId,
      timestamp: now.toISOString(),
      source: raw.meta?.source ?? 'live',
      // Contrato de tempo explicito (MET-02): o que e 'timestamp' vs 'fetchedAt'
      // e em que fuso 'hourly[].time'/'daily[].date' estao.
      timezone: 'America/Sao_Paulo',
      fetchedAt: raw.meta?.fetchedAt ?? null,
      // Idade real do conteudo (h) — derivada da coleta, nunca da escrita do arquivo.
      ageHours: raw.meta?.fetchedAt
        ? Math.round(((now.getTime() - new Date(raw.meta.fetchedAt).getTime()) / 3600000) * 10) / 10
        : null,
      meta: {
        dataKind: raw.meta?.dataKind ?? 'forecast',
        provider: raw.meta?.provider ?? 'Open-Meteo',
        model: raw.meta?.model ?? null,
      },
      current: {
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windGust: current.wind_gusts_10m ?? null,
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
            windGust: hourly.wind_gusts_10m?.[startIdx + i] ?? null,
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
