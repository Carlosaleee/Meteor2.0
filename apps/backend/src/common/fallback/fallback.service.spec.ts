import { Test, TestingModule } from '@nestjs/testing';
import { FallbackService } from './fallback.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';

jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue(JSON.stringify({
    data: { test: 'value' },
    updatedAt: new Date().toISOString(),
  })),
  writeFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

const fsMock = jest.mocked(fs);

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

  describe('loadWithTimestamp', () => {
    it('should derive contentAt from updatedAt when file has no contentAt (legacy)', async () => {
      const old = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
      fsMock.readFile.mockResolvedValueOnce(JSON.stringify({ data: { a: 1 }, updatedAt: old }) as never);
      const r = await service.loadWithTimestamp('legacy.json');
      expect(r.contentAt).toBe(old);
      // conteudo de 48h > maxAge 24h -> stale mesmo com contentAt caindo para updatedAt
      expect(r.isStale).toBe(true);
    });

    it('should prefer contentAt over updatedAt when both exist', async () => {
      const write = new Date().toISOString();
      const collected = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
      fsMock.readFile.mockResolvedValueOnce(JSON.stringify({ data: { a: 1 }, updatedAt: write, contentAt: collected }) as never);
      const r = await service.loadWithTimestamp('reused.json');
      expect(r.contentAt).toBe(collected);
      // escrita fresca NAO mascara conteudo de 48h
      expect(r.isStale).toBe(true);
    });
  });

  describe('save', () => {
    it('should write contentAt only when explicitly provided', async () => {
      await service.save('fresh.json', { a: 1 });
      const writtenFresh = JSON.parse(fsMock.writeFile.mock.calls.at(-1)![1] as string);
      expect(writtenFresh.updatedAt).toBeDefined();
      expect(writtenFresh.contentAt).toBeUndefined();

      const collected = '2026-10-28T10:00:00.000Z';
      await service.save('reused.json', { a: 1 }, collected);
      const writtenReused = JSON.parse(fsMock.writeFile.mock.calls.at(-1)![1] as string);
      expect(writtenReused.contentAt).toBe(collected);
      expect(writtenReused.updatedAt).not.toBe(collected);
    });
  });

  describe('isStale', () => {
    it('should treat null contentAt as stale', () => {
      expect(service.isStale(null)).toBe(true);
    });
  });
});
