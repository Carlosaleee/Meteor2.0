import { Test, TestingModule } from '@nestjs/testing';
import { WeatherNewsRepository } from './weather-news.repository';
import { FallbackService } from '../../common/fallback/fallback.service';

describe('WeatherNewsRepository', () => {
  let repository: WeatherNewsRepository;
  const originalFetch = global.fetch;

  const mockFallbackService = {
    load: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
    loadWithTimestamp: jest.fn().mockResolvedValue({ data: null, isStale: true }),
  };

  beforeEach(async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network disabled in tests')) as unknown as typeof fetch;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherNewsRepository,
        { provide: FallbackService, useValue: mockFallbackService },
      ],
    }).compile();

    repository = module.get<WeatherNewsRepository>(WeatherNewsRepository);
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getWeatherNews', () => {
    it('should return cached news when available', async () => {
      const cachedNews = [
        { id: '1', cityId: 'ilha-comprida', title: 'Notícia Cached', source: 'INMET', type: 'alerta', url: 'https://test.com', publishedAt: new Date().toISOString() },
      ];
      mockFallbackService.load.mockResolvedValueOnce({ news: cachedNews });

      const result = await repository.getWeatherNews();
      expect(result.news.length).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should filter by cityId when provided', async () => {
      const cachedNews = [
        { id: '1', cityId: 'ilha-comprida', title: 'IC News', source: 'INMET', type: 'alerta', url: 'https://test.com', publishedAt: new Date().toISOString() },
        { id: '2', cityId: 'iguape', title: 'Iguape News', source: 'INMET', type: 'boletim', url: 'https://test.com', publishedAt: new Date().toISOString() },
      ];
      mockFallbackService.load.mockResolvedValueOnce({ news: cachedNews });

      const result = await repository.getWeatherNews('ilha-comprida');
      expect(result.news.every(n => n.cityId === 'ilha-comprida')).toBe(true);
    });

    it('should return defaults on API failure', async () => {
      mockFallbackService.load.mockResolvedValueOnce(null);
      mockFallbackService.save.mockRejectedValueOnce(new Error('Save failed'));

      const result = await repository.getWeatherNews();
      expect(result.news.length).toBeGreaterThan(0);
      expect(result.news[0].source).toBeDefined();
    });
  });

  describe('forceRefresh', () => {
    it('should not save when fetch returns empty', async () => {
      mockFallbackService.load.mockResolvedValueOnce(null);
      await repository.forceRefresh();
      expect(mockFallbackService.save).not.toHaveBeenCalled();
    });
  });
});
