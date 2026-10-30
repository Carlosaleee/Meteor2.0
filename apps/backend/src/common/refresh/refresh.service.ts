import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OnModuleInit } from '@nestjs/common';
import { OpenMeteoRepository } from '../../modules/meteorology/open-meteo.repository';
import { MarineRepository } from '../../modules/oceanography/marine.repository';
import { NewsRepository } from '../../modules/news/news.repository';
import { WslRepository } from '../../modules/news/wsl.repository';
import { SpsurfRepository } from '../../modules/news/spsurf.repository';
import { WeatherNewsRepository } from '../../modules/meteorology/weather-news.repository';
import { NoticiasRegionaisRepository } from '../../modules/noticias-regionais/noticias-regionais.repository';
import { RagService } from '../../modules/iron/rag/rag.service';
import { singleFlight } from '../async/single-flight';

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
  private lastNewsRefresh: Date | null = null;
  private isRefreshing = false;

  constructor(
    private readonly openMeteoRepo: OpenMeteoRepository,
    private readonly marineRepo: MarineRepository,
    private readonly newsRepo: NewsRepository,
    private readonly wslRepo: WslRepository,
    private readonly spsurfRepo: SpsurfRepository,
    private readonly weatherNewsRepo: WeatherNewsRepository,
    private readonly regionalRepo: NoticiasRegionaisRepository,
    private readonly ragService: RagService,
  ) {}

  onModuleInit() {
    if (process.env.VERCEL) {
      this.logger.log('Serverless environment — startup refresh skipped (Vercel crons own the schedule)');
      return;
    }
    this.logger.log('RefreshService initialized — scheduling data refresh...');
    setTimeout(() => this.refreshAll(), 5000);
  }

  @Cron('0 */6 * * *')
  handleCron() {
    if (process.env.VERCEL) {
      // Em serverless os crons sao da Vercel (vercel.json) — @Cron dispararia
      // dentro de uma instancia quente, possivelmente no meio de um request.
      return;
    }
    this.logger.log('Cron triggered — refreshing all data sources...');
    this.refreshAll();
  }

  @Cron('0 * * * *')
  handleNewsCron() {
    if (process.env.VERCEL) {
      return;
    }
    this.logger.log('News cron triggered — refreshing rankings and news...');
    this.refreshNews();
  }

  async refreshNews(): Promise<{ success: boolean; details: Record<string, string>; duration: number }> {
    if (this.isRefreshing) {
      this.logger.warn('Refresh already in progress, skipping news refresh...');
      return { success: false, details: {}, duration: 0 };
    }

    this.isRefreshing = true;
    const start = Date.now();
    const details: Record<string, string> = {};

    try {
      await this.refreshNewsSources(details);
      await this.refreshRagIndex();
      this.lastNewsRefresh = new Date();
      const duration = Date.now() - start;
      this.logger.log(`Rankings and news refreshed in ${duration}ms`);
      return { success: true, details, duration };
    } catch (err) {
      this.logger.error(`Unexpected error during news refresh: ${err}`);
      return { success: false, details, duration: Date.now() - start };
    } finally {
      this.isRefreshing = false;
    }
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
      // 1+2+3. Fontes pesadas em paralelo (grupos independentes escritam em
      // arquivos distintos; dentro de meteorologia o saveFallback e serializado
      // no proprio repositorio para evitar last-writer-wins entre as 4 cidades).
      // Promise.allSettled: falha de um grupo nunca derruba os demais.
      this.logger.log('Refreshing heavy sources in parallel (meteorology x4, oceanography, weather news)...');
      const heavy = await Promise.allSettled([
        this.refreshMeteorology(details),
        (async () => {
          try {
            await this.marineRepo.forceRefresh(LOCATIONS[0].lat, LOCATIONS[0].lon);
            details['oceanography'] = 'OK';
            this.logger.log('Oceanography refreshed successfully');
          } catch (err) {
            details['oceanography'] = `ERROR: ${err}`;
            this.logger.error(`Oceanography refresh failed: ${err}`);
          }
        })(),
        (async () => {
          try {
            await this.weatherNewsRepo.forceRefresh();
            details['weather-news'] = 'OK';
            this.logger.log('Weather news refreshed successfully');
          } catch (err) {
            details['weather-news'] = `ERROR: ${err}`;
            this.logger.error(`Weather news refresh failed: ${err}`);
          }
        })(),
      ]);
      for (const r of heavy) {
        if (r.status === 'rejected') {
          this.logger.error(`Unexpected error in heavy refresh group: ${r.reason}`);
        }
      }

      // 4. Rankings WSL + News + Regionais
      await this.refreshNewsSources(details);

      // 5. Reindexa o "conhecimento base" do Irons (RAG) com os dados frescos
      await this.refreshRagIndex();

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

  private async refreshMeteorology(details: Record<string, string>): Promise<void> {
    this.logger.log('Refreshing meteorology data (4 cities in parallel)...');
    const results = await Promise.allSettled(
      LOCATIONS.map(loc => this.openMeteoRepo.forceRefresh(loc.lat, loc.lon, loc.id)),
    );

    const failed: string[] = [];
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        failed.push(`${LOCATIONS[i].id}: ${r.reason}`);
        this.logger.error(`Meteorology refresh failed for ${LOCATIONS[i].id}: ${r.reason}`);
      } else if (r.value === null) {
        // forceRefresh devolve null quando a fonte falhou (catch interno) —
        // reportar por cidade em vez de "OK" generico.
        failed.push(`${LOCATIONS[i].id}: sem dados`);
        this.logger.warn(`Meteorology refresh returned no data for ${LOCATIONS[i].id}`);
      }
    });

    const total = LOCATIONS.length;
    if (failed.length === 0) {
      details['meteorology'] = `OK (${total}/${total})`;
      this.logger.log('Meteorology refreshed successfully (4/4)');
    } else if (failed.length === total) {
      details['meteorology'] = `ERROR (${total}/${total} falharam): ${failed.join(' | ')}`;
    } else {
      details['meteorology'] = `ERROR parcial (${total - failed.length}/${total} OK): ${failed.join(' | ')}`;
    }
  }

  private async refreshNewsSources(details: Record<string, string>): Promise<void> {
    // Rankings WSL (explícito)
    this.logger.log('Refreshing WSL rankings...');
    try {
      this.wslRepo.clearCache();
      this.spsurfRepo.clearCache();
      const rankings = await this.wslRepo.getRankings();
      details['rankings'] = `OK (${rankings.men.length} men, ${rankings.women.length} women, ${rankings.events.length} events)`;
      this.logger.log(`Rankings refreshed: ${rankings.men.length} men, ${rankings.women.length} women, ${rankings.events.length} events`);
    } catch (err) {
      details['rankings'] = `ERROR: ${err}`;
      this.logger.error(`Rankings refresh failed: ${err}`);
    }

    // News (WSL + SPSurf)
    this.logger.log('Refreshing news data...');
    try {
      await this.newsRepo.forceRefresh();
      details['news'] = 'OK';
      this.logger.log('News refreshed successfully');
    } catch (err) {
      details['news'] = `ERROR: ${err}`;
      this.logger.error(`News refresh failed: ${err}`);
    }

    // Noticias regionais (RSS)
    this.logger.log('Refreshing regional news...');
    try {
      await this.regionalRepo.forceRefresh();
      details['regional-news'] = 'OK';
      this.logger.log('Regional news refreshed successfully');
    } catch (err) {
      details['regional-news'] = `ERROR: ${err}`;
      this.logger.error(`Regional news refresh failed: ${err}`);
    }

    this.lastNewsRefresh = new Date();
  }

  /** Reconstrói o índice RAG de dados após refresh; nunca derruba o refresh. */
  private async refreshRagIndex(): Promise<void> {
    try {
      await singleFlight('rag:rebuild', () => this.ragService.rebuildDataIndex());
    } catch (err) {
      this.logger.warn(`RAG data index rebuild failed: ${err}`);
    }
  }

  getStatus() {
    return {
      lastRefresh: this.lastRefresh?.toISOString() ?? null,
      lastNewsRefresh: this.lastNewsRefresh?.toISOString() ?? null,
      isRefreshing: this.isRefreshing,
    };
  }
}
