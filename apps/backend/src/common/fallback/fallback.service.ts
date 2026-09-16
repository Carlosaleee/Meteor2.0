import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Env } from '../config/env.schema';

export type FallbackData<T> = {
  updatedAt: string;
  data: T;
};

@Injectable()
export class FallbackService {
  private readonly logger = new Logger(FallbackService.name);
  private readonly fallbackDir: string;
  private readonly maxAgeMs: number;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.fallbackDir = path.resolve(
      process.cwd(),
      this.config.get('FALLBACK_DIR', { infer: true }) ?? 'data',
    );
    this.maxAgeMs =
      (this.config.get('FALLBACK_MAX_AGE_HOURS', { infer: true }) ?? 24) * 3600 * 1000;
  }

  async load<T>(filename: string): Promise<T | null> {
    const filePath = path.join(this.fallbackDir, filename);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as FallbackData<T>;
      return parsed.data;
    } catch {
      this.logger.warn(`Fallback file not found or unreadable: ${filePath}`);
      return null;
    }
  }

  async loadWithTimestamp<T>(filename: string): Promise<{ data: T | null; updatedAt: string | null; isStale: boolean }> {
    const filePath = path.join(this.fallbackDir, filename);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as FallbackData<T>;
      const updatedAt = parsed.updatedAt ?? null;
      const isStale = this.isStale(updatedAt);
      return { data: parsed.data, updatedAt, isStale };
    } catch {
      return { data: null, updatedAt: null, isStale: true };
    }
  }

  async save<T>(filename: string, data: T): Promise<void> {
    const filePath = path.join(this.fallbackDir, filename);
    try {
      await fs.mkdir(this.fallbackDir, { recursive: true });
      const payload: FallbackData<T> = {
        updatedAt: new Date().toISOString(),
        data,
      };
      await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');
      this.logger.log(`Fallback saved: ${filename}`);
    } catch (err) {
      this.logger.error(`Failed to save fallback ${filename}`, err);
    }
  }

  isStale(updatedAt: string | null): boolean {
    if (!updatedAt) return true;
    const diff = Date.now() - new Date(updatedAt).getTime();
    return diff > this.maxAgeMs;
  }
}
