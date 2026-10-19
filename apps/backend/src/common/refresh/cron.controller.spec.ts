import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
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
    process.env.CRON_SECRET = 'test-secret';
  });

  afterAll(() => {
    delete process.env.CRON_SECRET;
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

  describe('refresh (POST)', () => {
    it('should trigger refresh with valid x-cron-secret', async () => {
      const result = await controller.refresh('test-secret') as { success: boolean };
      expect(result.success).toBe(true);
      expect(mockRefreshService.refreshAll).toHaveBeenCalled();
    });

    it('should accept valid secret via Authorization Bearer header', async () => {
      const result = await controller.refresh(undefined, 'Bearer test-secret') as { success: boolean };
      expect(result.success).toBe(true);
      expect(mockRefreshService.refreshAll).toHaveBeenCalled();
    });

    it('should reject with invalid secret (UnauthorizedException)', async () => {
      await expect(controller.refresh('wrong-secret')).rejects.toThrow(UnauthorizedException);
      expect(mockRefreshService.refreshAll).not.toHaveBeenCalled();
    });

    it('should run news-only refresh when scope=news', async () => {
      const result = await controller.refresh('test-secret', undefined, 'news') as { success: boolean };
      expect(result.success).toBe(true);
      expect(mockRefreshService.refreshNews).toHaveBeenCalled();
      expect(mockRefreshService.refreshAll).not.toHaveBeenCalled();
    });
  });

  describe('refreshFromCron (GET — Vercel crons)', () => {
    it('should accept Authorization Bearer sent natively by Vercel crons', async () => {
      const result = await controller.refreshFromCron(undefined, 'Bearer test-secret') as { success: boolean };
      expect(result.success).toBe(true);
      expect(mockRefreshService.refreshAll).toHaveBeenCalled();
    });

    it('should accept valid secret via query param', async () => {
      const result = await controller.refreshFromCron(undefined, undefined, 'test-secret') as { success: boolean };
      expect(result.success).toBe(true);
    });

    it('should REJECT x-vercel-cron header without real secret (spoofable)', async () => {
      await expect(controller.refreshFromCron(undefined, undefined, undefined)).rejects.toThrow(UnauthorizedException);
      expect(mockRefreshService.refreshAll).not.toHaveBeenCalled();
    });

    it('should reject when CRON_SECRET is not configured', async () => {
      delete process.env.CRON_SECRET;
      await expect(controller.refreshFromCron('test-secret')).rejects.toThrow(UnauthorizedException);
    });
  });
});
