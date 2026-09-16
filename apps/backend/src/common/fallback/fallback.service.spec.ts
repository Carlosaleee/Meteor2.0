import { Test, TestingModule } from '@nestjs/testing';
import { FallbackService } from './fallback.service';
import { ConfigService } from '@nestjs/config';

jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue(JSON.stringify({
    data: { test: 'value' },
    updatedAt: new Date().toISOString(),
  })),
  writeFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

describe('FallbackService', () => {
  let service: FallbackService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        FALLBACK_DIR: 'data',
        FALLBACK_MAX_AGE_HOURS: '24',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FallbackService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<FallbackService>(FallbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('load', () => {
    it('should load JSON file', async () => {
      const result = await service.load('test.json');
      expect(result).toEqual({ test: 'value' });
    });
  });
});
