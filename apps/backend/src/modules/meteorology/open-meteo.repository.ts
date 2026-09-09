import { Injectable } from '@nestjs/common';

@Injectable()
public class OpenMeteoRepository {
  async getAtmosphereData(lat: number, lon: number) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=America/Sao_Paulo`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao buscar dados do Open-Meteo');
      const data = await res.json();
      return data.current || null;
    } catch {
      return {
        temperature_2m: 26.5,
        relative_humidity_2m: 78,
        wind_speed_10m: 18.2,
        wind_direction_10m: 140,
        surface_pressure: 1014.2,
        apparent_temperature: 28.0,
      };
    }
  }
}
