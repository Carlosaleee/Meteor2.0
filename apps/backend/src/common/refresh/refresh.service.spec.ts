import { Test, TestingModule } from '@nestjs/testing';
import { RefreshService } from './refresh.service';
import { OpenMeteoRepository } from '../../modules/meteorology/open-meteo.repository';
import { MarineRepository } from '../../modules/oceanography/marine.repository';
import { NewsRepository } from '../../modules/news/news.repository';
import { WslRepository } from '../../modules/news/wsl.repository';
import { SpsurfRepository } from '../../modules/news/spsurf.repository';
import { WeatherNewsRepository } from '../../modules/meteorology/weather-news.repository';

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
      expect(result.duration).toBeGreaterThan(0);
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
});
