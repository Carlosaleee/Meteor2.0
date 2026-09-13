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
      expect(result.hourly).toHaveLength(2);
    });

    it('should include daily data', async () => {
      const result = await service.getCurrentWeather();
      expect(result.daily).toHaveLength(1);
    });
  });
});
