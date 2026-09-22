import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OnModuleInit } from '@nestjs/common';
import { OpenMeteoRepository } from '../../modules/meteorology/open-meteo.repository';
import { MarineRepository } from '../../modules/oceanography/marine.repository';
import { NewsRepository } from '../../modules/news/news.repository';
import { WslRepository } from '../../modules/news/wsl.repository';
import { SpsurfRepository } from '../../modules/news/spsurf.repository';

const LOCATIONS = [
  { id: 'ilha-comprida', lat: -24.73, lon: -47.55 },
  { id: 'iguape', lat: -24.70, lon: -47.55 },
  { id: 'cananeia', lat: -25.01, lon: -47.92 },
  { id: 'registro', lat: -24.48, lon: -47.84 },
];

@Injectable()
export class RefreshService implements OnModuleInit {
  private readonly logger = new Logger(RefreshService.name);
  private lastRefresh: Date | null = null;
  private isRefreshing = false;

  constructor(
    private readonly openMeteoRepo: OpenMeteoRepository,
    private readonly marineRepo: MarineRepository,
    private readonly newsRepo: NewsRepository,
    private readonly wslRepo: WslRepository,
    private readonly spsurfRepo: SpsurfRepository,
  ) {}

  onModuleInit() {
    this.logger.log('RefreshService initialized — scheduling data refresh...');
    setTimeout(() => this.refreshAll(), 5000);
  }

  @Cron('0 */6 * * *')
  handleCron() {
    this.logger.log('Cron triggered — refreshing all data sources...');
    this.refreshAll();
  }

  async refreshAll(): Promise<{ success: boolean; details: Record<string, string>; duration: number }> {
    if (this.isRefreshing) {
      this.logger.warn('Refresh already in progress, skipping...');
      return { success: false, details: {}, duration: 0 };
    }

    this.isRefreshing = true;
    const start = Date.now();
    const details: Record<string, string> = {};

    try {
      this.logger.log('Refreshing meteorology data...');
      try {
        for (const loc of LOCATIONS) {
          await this.openMeteoRepo.forceRefresh(loc.lat, loc.lon);
        }
        details['meteorology'] = 'OK';
        this.logger.log('Meteorology refreshed successfully');
      } catch (err) {
        details['meteorology'] = `ERROR: ${err}`;
        this.logger.error(`Meteorology refresh failed: ${err}`);
      }

      this.logger.log('Refreshing oceanography data...');
      try {
        await this.marineRepo.forceRefresh(LOCATIONS[0].lat, LOCATIONS[0].lon);
        details['oceanography'] = 'OK';
        this.logger.log('Oceanography refreshed successfully');
      } catch (err) {
        details['oceanography'] = `ERROR: ${err}`;
        this.logger.error(`Oceanography refresh failed: ${err}`);
      }

      this.logger.log('Refreshing news data...');
      try {
        this.wslRepo.clearCache();
        this.spsurfRepo.clearCache();
        await this.newsRepo.forceRefresh();
        details['news'] = 'OK';
        this.logger.log('News refreshed successfully');
      } catch (err) {
        details['news'] = `ERROR: ${err}`;
        this.logger.error(`News refresh failed: ${err}`);
      }

      this.lastRefresh = new Date();
      const duration = Date.now() - start;
      this.logger.log(`All data sources refreshed in ${duration}ms`);
      return { success: true, details, duration };
    } catch (err) {
      this.logger.error(`Unexpected error during refresh: ${err}`);
      return { success: false, details, duration: Date.now() - start };
    } finally {
      this.isRefreshing = false;
    }
  }

  getStatus() {
    return {
      lastRefresh: this.lastRefresh?.toISOString() ?? null,
      isRefreshing: this.isRefreshing,
    };
  }
}
