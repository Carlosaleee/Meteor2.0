import { Injectable } from '@nestjs/common';

@Injectable()
export class MarineRepository {
  async getMarineData(lat: number, lon: number) {
    try {
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&timezone=America/Sao_Paulo`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao buscar dados marinhos');
      const data = await res.json();
      return data.current || null;
    } catch {
      return {
        wave_height: 1.2,
        wave_period: 10,
        wave_direction: 140,
        swell_wave_height: 1.0,
        swell_wave_period: 11,
        swell_wave_direction: 135,
      };
    }
  }
}
