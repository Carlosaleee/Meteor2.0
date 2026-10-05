import { Test, TestingModule } from '@nestjs/testing';
import { CronController } from './cron.controller';
import { RefreshService } from './refresh.service';

describe('CronController', () => {
  let controller: CronController;

  const mockRefreshService = {
    getStatus: jest.fn().mockReturnValue({
      lastRefresh: new Date().toISOString(),
      isRefreshing: false,
    }),
    refreshAll: jest.fn().mockResolvedValue({
      success: true,
      details: { meteorology: 'OK', oceanography: 'OK' },
      duration: 1500,
    }),
    refreshNews: jest.fn().mockResolvedValue({
      success: true,
      details: { rankings: 'OK (15 men, 15 women, 7 events)' },
      duration: 400,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronController],
      providers: [
        { provide: RefreshService, useValue: mockRefreshService },
      ],
    }).compile();

    controller = module.get<CronController>(CronController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return refresh status', () => {
      const result = controller.getStatus();
      expect(result.lastRefresh).toBeDefined();
      expect(result.isRefreshing).toBe(false);
    });
  });

  describe('refresh', () => {
    it('should trigger refresh with valid secret', async () => {
      process.env.CRON_SECRET = 'test-secret';
      const result = await controller.refresh('test-secret') as { success: boolean };
      expect(result.success).toBe(true);
      expect(mockRefreshService.refreshAll).toHaveBeenCalled();
    });

    it('should reject with invalid secret', async () => {
      process.env.CRON_SECRET = 'test-secret';
      const result = await controller.refresh('wrong-secret') as { error: string };
      expect(result.error).toBe('Unauthorized');
    });

    it('should run news-only refresh when scope=news', async () => {
      process.env.CRON_SECRET = 'test-secret';
      const result = await controller.refresh('test-secret', 'news') as { success: boolean };
      expect(result.success).toBe(true);
      expect(mockRefreshService.refreshNews).toHaveBeenCalled();
      expect(mockRefreshService.refreshAll).not.toHaveBeenCalled();
    });
  });

  describe('refreshFromCron (GET — Vercel crons)', () => {
    it('should authorize x-vercel-cron header without secret', async () => {
      const result = await controller.refreshFromCron(undefined, '1') as { success: boolean };
      expect(result.success).toBe(true);
      expect(mockRefreshService.refreshAll).toHaveBeenCalled();
    });

    it('should accept valid secret via query param', async () => {
      process.env.CRON_SECRET = 'test-secret';
      const result = await controller.refreshFromCron(undefined, undefined, 'test-secret') as { success: boolean };
      expect(result.success).toBe(true);
    });

    it('should reject without secret or vercel-cron header', async () => {
      const result = await controller.refreshFromCron() as { error: string };
      expect(result.error).toBe('Unauthorized');
    });
  });
});
