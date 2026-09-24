import { Test, TestingModule } from '@nestjs/testing';
import { RefreshService } from './refresh.service';
import { OpenMeteoRepository } from '../../modules/meteorology/open-meteo.repository';
import { MarineRepository } from '../../modules/oceanography/marine.repository';
import { NewsRepository } from '../../modules/news/news.repository';
import { WslRepository } from '../../modules/news/wsl.repository';
import { SpsurfRepository } from '../../modules/news/spsurf.repository';
import { WeatherNewsRepository } from '../../modules/meteorology/weather-news.repository';
import { NoticiasRegionaisRepository } from '../../modules/noticias-regionais/noticias-regionais.repository';

describe('RefreshService', () => {
  let service: RefreshService;

  const mockOpenMeteoRepo = {
    forceRefresh: jest.fn().mockResolvedValue(null),
  };

  const mockMarineRepo = {
    forceRefresh: jest.fn().mockResolvedValue(null),
  };

  const mockNewsRepo = {
    forceRefresh: jest.fn().mockResolvedValue(undefined),
  };

  const mockWslRepo = {
    clearCache: jest.fn(),
    getRankings: jest.fn().mockResolvedValue({
      men: [{ rank: 1, name: 'Test', country: 'Brazil', points: 40000 }],
      women: [{ rank: 1, name: 'Test', country: 'Brazil', points: 35000 }],
      events: [{ name: 'Test Pro', location: 'SP', dates: '20-25 Set', status: 'Upcoming' }],
    }),
  };

  const mockSpsurfRepo = {
    clearCache: jest.fn(),
  };

  const mockWeatherNewsRepo = {
    forceRefresh: jest.fn().mockResolvedValue(undefined),
  };

  const mockRegionalRepo = {
    forceRefresh: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshService,
        { provide: OpenMeteoRepository, useValue: mockOpenMeteoRepo },
        { provide: MarineRepository, useValue: mockMarineRepo },
        { provide: NewsRepository, useValue: mockNewsRepo },
        { provide: WslRepository, useValue: mockWslRepo },
        { provide: SpsurfRepository, useValue: mockSpsurfRepo },
        { provide: WeatherNewsRepository, useValue: mockWeatherNewsRepo },
        { provide: NoticiasRegionaisRepository, useValue: mockRegionalRepo },
      ],
    }).compile();

    service = module.get<RefreshService>(RefreshService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refreshAll', () => {
    it('should refresh all data sources', async () => {
      const result = await service.refreshAll();
      expect(result.success).toBe(true);
      expect(result.details['meteorology']).toBe('OK');
      expect(result.details['oceanography']).toBe('OK');
      expect(result.details['weather-news']).toBe('OK');
      expect(result.details['rankings']).toContain('OK');
      expect(result.details['news']).toBe('OK');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should call forceRefresh for meteorology', async () => {
      await service.refreshAll();
      expect(mockOpenMeteoRepo.forceRefresh).toHaveBeenCalledTimes(4);
    });

    it('should call forceRefresh for oceanography', async () => {
      await service.refreshAll();
      expect(mockMarineRepo.forceRefresh).toHaveBeenCalled();
    });

    it('should call forceRefresh for weather news', async () => {
      await service.refreshAll();
      expect(mockWeatherNewsRepo.forceRefresh).toHaveBeenCalled();
    });

    it('should clear WSL cache and fetch rankings', async () => {
      await service.refreshAll();
      expect(mockWslRepo.clearCache).toHaveBeenCalled();
      expect(mockSpsurfRepo.clearCache).toHaveBeenCalled();
      expect(mockWslRepo.getRankings).toHaveBeenCalled();
    });

    it('should call forceRefresh for news', async () => {
      await service.refreshAll();
      expect(mockNewsRepo.forceRefresh).toHaveBeenCalled();
    });

    it('should call forceRefresh for regional news', async () => {
      const result = await service.refreshAll();
      expect(mockRegionalRepo.forceRefresh).toHaveBeenCalled();
      expect(result.details['regional-news']).toBe('OK');
    });

    it('should not run concurrent refreshes', async () => {
      const promise1 = service.refreshAll();
      const promise2 = service.refreshAll();
      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
    });

    it('should return lastRefresh timestamp', async () => {
      await service.refreshAll();
      const status = service.getStatus();
      expect(status.lastRefresh).toBeDefined();
      expect(status.isRefreshing).toBe(false);
    });

    it('should handle meteorology refresh failure gracefully', async () => {
      mockOpenMeteoRepo.forceRefresh.mockRejectedValueOnce(new Error('API Error'));
      const result = await service.refreshAll();
      expect(result.success).toBe(true);
      expect(result.details['meteorology']).toContain('ERROR');
    });
  });

  describe('refreshNews', () => {
    it('should refresh only news sources', async () => {
      const result = await service.refreshNews();
      expect(result.success).toBe(true);
      expect(result.details['rankings']).toContain('OK');
      expect(result.details['news']).toBe('OK');
      expect(result.details['regional-news']).toBe('OK');
      expect(mockOpenMeteoRepo.forceRefresh).not.toHaveBeenCalled();
      expect(mockMarineRepo.forceRefresh).not.toHaveBeenCalled();
    });

    it('should expose lastNewsRefresh in status', async () => {
      await service.refreshNews();
      const status = service.getStatus();
      expect(status.lastNewsRefresh).toBeTruthy();
      expect(status.lastRefresh).toBeNull();
      expect(status.isRefreshing).toBe(false);
    });

    it('should not run concurrent news refreshes', async () => {
      const [result1, result2] = await Promise.all([service.refreshNews(), service.refreshNews()]);
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
    });

    it('should handle regional news failure gracefully', async () => {
      mockRegionalRepo.forceRefresh.mockRejectedValueOnce(new Error('RSS down'));
      const result = await service.refreshNews();
      expect(result.success).toBe(true);
      expect(result.details['regional-news']).toContain('ERROR');
    });
  });
});
