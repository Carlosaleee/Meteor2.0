import { Test, TestingModule } from '@nestjs/testing';
import { MeteorologyService } from './meteorology.service';
import { OpenMeteoRepository } from './open-meteo.repository';

describe('MeteorologyService', () => {
  let service: MeteorologyService;

  const mockOpenMeteoRepository = {
    getAtmosphereData: jest.fn().mockResolvedValue({
      current: {
        temperature_2m: 25,
        apparent_temperature: 27,
        relative_humidity_2m: 70,
        wind_speed_10m: 12,
        wind_gusts_10m: 21,
        wind_direction_10m: 180,
        surface_pressure: 1013,
        precipitation: 0,
        weather_code: 1,
      },
      hourly: {
        time: ['2024-01-01T00:00', '2024-01-01T01:00'],
        temperature_2m: [24, 25],
        relative_humidity_2m: [72, 70],
        precipitation_probability: [10, 15],
        precipitation: [0, 0],
        weather_code: [1, 2],
        wind_speed_10m: [11, 12],
        wind_gusts_10m: [18, 21],
        cloud_cover: [50, 60],
        visibility: [10000, 9000],
      },
      daily: {
        time: ['2024-01-01'],
        temperature_2m_max: [28],
        temperature_2m_min: [20],
        precipitation_sum: [0],
        precipitation_probability_max: [20],
        wind_speed_10m_max: [15],
        weather_code: [1],
        sunrise: ['2024-01-01T06:00'],
        sunset: ['2024-01-01T18:00'],
        uv_index_max: [8],
      },
      meta: {
        source: 'live',
        fetchedAt: '2026-10-30T12:00:00.000Z',
        dataKind: 'forecast',
        provider: 'Open-Meteo',
        model: 'best_match',
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeteorologyService,
        { provide: OpenMeteoRepository, useValue: mockOpenMeteoRepository },
      ],
    }).compile();

    service = module.get<MeteorologyService>(MeteorologyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentWeather', () => {
    it('should return weather for default location', async () => {
      const result = await service.getCurrentWeather();
      expect(result.current.temperature).toBe(25);
      expect(result.current.humidity).toBe(70);
    });

    it('should return weather for specific location', async () => {
      const result = await service.getCurrentWeather('iguape');
      expect(result.locationId).toBe('iguape');
    });

    it('should include hourly data', async () => {
      const result = await service.getCurrentWeather();
      expect(Array.isArray(result.hourly)).toBe(true);
      expect(result.hourly.length).toBeGreaterThanOrEqual(1);
      expect(result.hourly[0]).toHaveProperty('time');
      expect(result.hourly[0]).toHaveProperty('temperature');
    });

    it('should include daily data', async () => {
      const result = await service.getCurrentWeather();
      expect(result.daily).toHaveLength(1);
    });

    it('should expose explicit temporal contract (timezone, fetchedAt, meta)', async () => {
      const result = await service.getCurrentWeather();
      expect(result.timezone).toBe('America/Sao_Paulo');
      expect(result.fetchedAt).toBe('2026-10-30T12:00:00.000Z');
      expect(typeof result.ageHours).toBe('number');
      expect(result.ageHours).toBeGreaterThanOrEqual(0);
      expect(result.meta).toEqual({
        dataKind: 'forecast',
        provider: 'Open-Meteo',
        model: 'best_match',
      });
      // timestamp continua sendo o instante da resposta (contrato legado mantido)
      expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should expose wind gusts in current and hourly', async () => {
      const result = await service.getCurrentWeather();
      expect(result.current.windGust).toBe(21);
      expect(result.hourly[0].windGust).toBe(18);
    });

    it('should default fetchedAt/meta when repository has no provenance (legacy cache)', async () => {
      mockOpenMeteoRepository.getAtmosphereData.mockResolvedValueOnce({
        current: { temperature_2m: 20, apparent_temperature: 20, relative_humidity_2m: 80, wind_speed_10m: 10, wind_direction_10m: 90, surface_pressure: 1015, precipitation: 0, weather_code: 1 },
        hourly: { time: [], temperature_2m: [], relative_humidity_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], cloud_cover: [], visibility: [] },
        daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [], weather_code: [], sunrise: [], sunset: [], uv_index_max: [] },
      });
      const result = await service.getCurrentWeather();
      expect(result.fetchedAt).toBeNull();
      expect(result.meta.dataKind).toBe('forecast');
      expect(result.source).toBe('live');
      expect(result.current.windGust).toBeNull();
    });
  });
});
