import { Injectable } from '@nestjs/common';
import { MarineRepository } from './marine.repository';
import { GeminiRepository } from './gemini.repository';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-oceanography.json';

@Injectable()
export class OceanographyService {
  private summaryCache: { text: string; ts: number } | null = null;
  private readonly SUMMARY_TTL_MS = 3600_000;

  constructor(
    private readonly marineRepo: MarineRepository,
    private readonly geminiRepo: GeminiRepository,
    private readonly fallback: FallbackService,
  ) {}

  async getSwellConditions() {
    const marine = await this.marineRepo.getMarineData(-24.73, -47.55);

    const height = marine.wave_height ?? 1.1;
    let qualityLabel = 'Boas';
    let qualityEmoji = '🏄';
    if (height < 0.5) { qualityLabel = 'Flat'; qualityEmoji = '🌊'; }
    else if (height < 1.0) { qualityLabel = 'Pequenas'; qualityEmoji = '🌊'; }
    else if (height < 1.5) { qualityLabel = 'Boas'; qualityEmoji = '🏄'; }
    else { qualityLabel = 'Clássico!'; qualityEmoji = '🏆'; }

    const fallbackData = this.fallback.load<{
      quality: { bestTime: string };
      tides: { nextHigh: string; nextLow: string; coefficient: number };
      spots: Array<{ id: string; name: string; lat: number; lon: number; level: string; bestWind: string; exposure: string; howToGetThere: string }>;
    }>(FALLBACK_FILE);

    return {
      location: 'Ilha Comprida & Costa',
      timestamp: new Date().toISOString(),
      current: {
        waveHeight: marine.wave_height,
        wavePeriod: marine.wave_period,
        waveDirection: marine.wave_direction,
        swellHeight: marine.swell_wave_height,
        swellPeriod: marine.swell_wave_period,
        swellDirection: marine.swell_wave_direction,
        windSpeed: marine.wind_speed_10m,
        windDirection: marine.wind_direction_10m,
        windGust: marine.wind_gusts_10m,
      },
      qualityLabel,
      qualityEmoji,
      bestTime: fallbackData?.quality?.bestTime ?? '08:00 - 11:00',
      nextTide: fallbackData?.tides?.nextHigh ?? '14:30',
      tideCoefficient: fallbackData?.tides?.coefficient ?? 0.78,
      spots: fallbackData?.spots ?? [],
    };
  }

  async getHourlyForecast() {
    return this.marineRepo.getHourlyData(-24.73, -47.55);
  }

  async getAiSummary() {
    if (this.summaryCache && Date.now() - this.summaryCache.ts < this.SUMMARY_TTL_MS) {
      return { summary: this.summaryCache.text, cached: true };
    }

    const marine = await this.marineRepo.getMarineData(-24.73, -47.55);
    const fallbackData = this.fallback.load<{
      quality: { bestTime: string };
      tides: { nextHigh: string; nextLow: string; coefficient: number };
    }>(FALLBACK_FILE);

    const height = marine.wave_height ?? 1.1;
    let qualityLabel = 'Boas';
    if (height < 0.5) qualityLabel = 'Flat';
    else if (height < 1.0) qualityLabel = 'Pequenas';
    else if (height >= 1.5) qualityLabel = 'Clássico!';

    const summary = await this.geminiRepo.generateSummary({
      waveHeight: marine.wave_height,
      wavePeriod: marine.wave_period,
      waveDirection: marine.wave_direction,
      swellHeight: marine.swell_wave_height,
      swellPeriod: marine.swell_wave_period,
      swellDirection: marine.swell_wave_direction,
      windSpeed: marine.wind_speed_10m,
      windDirection: marine.wind_direction_10m,
      windGust: marine.wind_gusts_10m,
      qualityLabel,
      bestTime: fallbackData?.quality?.bestTime ?? '08:00 - 11:00',
      nextTide: fallbackData?.tides?.nextHigh ?? '14:30',
      tideCoefficient: fallbackData?.tides?.coefficient ?? 0.78,
    });

    this.summaryCache = { text: summary, ts: Date.now() };
    return { summary, cached: false };
  }
}
