import { Test, TestingModule } from '@nestjs/testing';
import { MeteorologyController } from './meteorology.controller';
import { MeteorologyService } from './meteorology.service';
import { WeatherNewsRepository } from './weather-news.repository';

describe('MeteorologyController', () => {
  let controller: MeteorologyController;

  const mockMeteorologyService = {
    getCurrentWeather: jest.fn().mockResolvedValue({
      location: 'Ilha Comprida',
      locationId: 'ilha-comprida',
      current: { temperature: 25, humidity: 70, windSpeed: 12, weatherCode: 1 },
      hourly: [],
      daily: [],
    }),
  };

  const mockWeatherNewsRepo = {
    getWeatherNews: jest.fn().mockResolvedValue({
      news: [{ id: '1', cityId: 'ilha-comprida', title: 'Teste', source: 'INMET', type: 'alerta', url: 'https://test.com', publishedAt: new Date().toISOString() }],
      timestamp: new Date().toISOString(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeteorologyController],
      providers: [
        { provide: MeteorologyService, useValue: mockMeteorologyService },
        { provide: WeatherNewsRepository, useValue: mockWeatherNewsRepo },
      ],
    }).compile();

    controller = module.get<MeteorologyController>(MeteorologyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather data', async () => {
      const result = await controller.getWeather('ilha-comprida');
      expect(result.location).toBe('Ilha Comprida');
      expect(result.current).toBeDefined();
    });

    it('should use default location', async () => {
      await controller.getWeather();
      expect(mockMeteorologyService.getCurrentWeather).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getWeatherNews', () => {
    it('should return weather news', async () => {
      const result = await controller.getWeatherNews();
      expect(result.news).toBeDefined();
      expect(result.news.length).toBeGreaterThan(0);
    });

    it('should filter by cityId', async () => {
      await controller.getWeatherNews('ilha-comprida');
      expect(mockWeatherNewsRepo.getWeatherNews).toHaveBeenCalledWith('ilha-comprida');
    });
  });
});
