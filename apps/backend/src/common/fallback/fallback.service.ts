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
  private readonly readDirs: string[];
  private readonly writeDir: string;
  private readonly maxAgeMs: number;

  constructor(private readonly config: ConfigService<Env, true>) {
    const dir = this.config.get('FALLBACK_DIR', { infer: true }) ?? 'data';
    this.maxAgeMs =
      (this.config.get('FALLBACK_MAX_AGE_HOURS', { infer: true }) ?? 24) * 3600 * 1000;

    const cwdDir = path.resolve(process.cwd(), dir);

    // Vercel serverless: raiz do bundle e read-only; /tmp e persistente por instancia quente.
    if (process.env.VERCEL) {
      this.writeDir = path.join('/tmp', dir);
      this.readDirs = [this.writeDir, cwdDir];
    } else {
      this.writeDir = cwdDir;
      this.readDirs = [cwdDir];
    }
  }

  private async readFirst(filename: string): Promise<string | null> {
    for (const dir of this.readDirs) {
      try {
        return await fs.readFile(path.join(dir, filename), 'utf-8');
      } catch {
        // tenta o proximo diretorio
      }
    }
    return null;
  }

  async load<T>(filename: string): Promise<T | null> {
    const raw = await this.readFirst(filename);
    if (raw === null) {
      this.logger.warn(`Fallback file not found: ${filename} (searched: ${this.readDirs.join(', ')})`);
      return null;
    }
    try {
      return (JSON.parse(raw) as FallbackData<T>).data;
    } catch {
      this.logger.warn(`Fallback file unreadable: ${filename}`);
      return null;
    }
  }

  async loadWithTimestamp<T>(filename: string): Promise<{ data: T | null; updatedAt: string | null; isStale: boolean }> {
    const raw = await this.readFirst(filename);
    if (raw === null) {
      return { data: null, updatedAt: null, isStale: true };
    }
    try {
      const parsed = JSON.parse(raw) as FallbackData<T>;
      const updatedAt = parsed.updatedAt ?? null;
      return { data: parsed.data ?? null, updatedAt, isStale: this.isStale(updatedAt) };
    } catch {
      return { data: null, updatedAt: null, isStale: true };
    }
  }

  async save<T>(filename: string, data: T): Promise<void> {
    const filePath = path.join(this.writeDir, filename);
    try {
      await fs.mkdir(this.writeDir, { recursive: true });
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
