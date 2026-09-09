import { Injectable } from '@nestjs/common';
import { MarineRepository } from './marine.repository';

@Injectable()
export class OceanographyService {
  constructor(private readonly marineRepo: MarineRepository) {}

  async getSwellConditions() {
    const marine = await this.marineRepo.getMarineData(-24.73, -47.55);

    const height = marine.wave_height ?? 1.2;
    let quality = 'Boas';
    let emoji = '🏄';
    if (height < 0.5) { quality = 'Flat'; emoji = '🌊'; }
    else if (height < 1.0) { quality = 'Pequenas'; emoji = '🌊'; }
    else if (height < 1.5) { quality = 'Boas'; emoji = '🏄'; }
    else { quality = 'Clássico!'; emoji = '🏆'; }

    return {
      location: 'Ilha Comprida & Costa',
      timestamp: new Date().toISOString(),
      current: {
        waveHeight: height,
        wavePeriod: marine.wave_period ?? 10,
        waveDirection: marine.wave_direction ?? 140,
        swellHeight: marine.swell_wave_height ?? 1.0,
        swellPeriod: marine.swell_wave_period ?? 11,
        swellDirection: marine.swell_wave_direction ?? 135,
      },
      qualityLabel: quality,
      qualityEmoji: emoji,
      bestTime: '08:00 - 11:00',
      nextTide: '14:30',
      tideCoefficient: 0.82,
    };
  }
}
