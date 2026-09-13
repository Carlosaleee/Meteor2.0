import { Test, TestingModule } from '@nestjs/testing';
import { OceanographyService } from './oceanography.service';
import { MarineRepository } from './marine.repository';
import { GeminiRepository } from './gemini.repository';
import { FallbackService } from '../../common/fallback/fallback.service';

describe('OceanographyService', () => {
  let service: OceanographyService;

  const mockMarineRepository = {
    getMarineData: jest.fn().mockResolvedValue({
      wave_height: 1.2,
      wave_period: 10,
      wave_direction: 150,
      swell_wave_height: 1.0,
      swell_wave_period: 12,
      swell_wave_direction: 160,
      wind_speed_10m: 12,
      wind_direction_10m: 180,
      wind_gusts_10m: 18,
    }),
    getHourlyData: jest.fn().mockResolvedValue([
      { windSpeed: 12, windGust: 18, windDirection: 180 },
    ]),
  };

  const mockGeminiRepository = {
    generateSummary: jest.fn().mockResolvedValue('Briefing de teste'),
  };

  const mockFallbackService = {
    load: jest.fn().mockReturnValue({
      quality: { bestTime: '08:00 - 11:00' },
      tides: { nextHigh: '14:30', nextLow: '20:30', coefficient: 0.78 },
      spots: [],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OceanographyService,
        { provide: MarineRepository, useValue: mockMarineRepository },
        { provide: GeminiRepository, useValue: mockGeminiRepository },
        { provide: FallbackService, useValue: mockFallbackService },
      ],
    }).compile();

    service = module.get<OceanographyService>(OceanographyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSwellConditions', () => {
    it('should return swell conditions', async () => {
      const result = await service.getSwellConditions();
      expect(result.current.waveHeight).toBe(1.2);
      expect(result.qualityLabel).toBeDefined();
    });

    it('should calculate quality label', async () => {
      const result = await service.getSwellConditions();
      expect(['Flat', 'Pequenas', 'Boas', 'Clássico!']).toContain(result.qualityLabel);
    });
  });

  describe('getHourlyForecast', () => {
    it('should return hourly data', async () => {
      const result = await service.getHourlyForecast();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
