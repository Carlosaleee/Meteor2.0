import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FallbackService } from '../../common/fallback/fallback.service';
import { fetchWithTimeout } from '../../common/http/fetch-timeout';
import type { Env } from '../../common/config/env.schema';

const FALLBACK_FILE = 'fallback-meteorology.json';

export type CurrentData = {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  /** Rajada (km/h) — opcional em caches antigos gravados antes do campo existir. */
  wind_gusts_10m?: number;
  wind_direction_10m: number;
  surface_pressure: number;
};

export type HourlyData = {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  /** Rajada por hora (km/h) — opcional em caches antigos. */
  wind_gusts_10m?: number[];
  cloud_cover: number[];
  visibility: number[];
};

export type DailyData = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  weather_code: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
};

export type AtmosphereData = {
  current: CurrentData;
  hourly: HourlyData;
  daily: DailyData;
  meta?: {
    /** Frescor do conteudo — 'sample' = sintetico (nunca apresentar como real). */
    source: 'live' | 'stale' | 'sample';
    /** Momento em que o backend coletou o conteudo da API (mantido em caches/stale). */
    fetchedAt?: string;
    /** Natureza do dado: previsao de modelo, observacao ou sintetico. */
    dataKind?: 'forecast' | 'sample';
    provider?: string;
    model?: string;
  };
};

/** Modelo efetivamente pedido ao Open-Meteo (env OPEN_METEO_MODELS, padrao best_match). */
const DEFAULT_METEO_MODEL = 'best_match';

/** Query compartilhada por forceRefresh e getAtmosphereData (inclui rajadas). Exportada para teste. */
export function buildForecastUrl(lat: number, lon: number, model: string): string {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure`
    + `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,cloud_cover,visibility`
    + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code,sunrise,sunset,uv_index_max`
    + `&forecast_days=7&timezone=America/Sao_Paulo`
    + `&models=${encodeURIComponent(model)}`;
}

@Injectable()
export class OpenMeteoRepository {
  private readonly logger = new Logger(OpenMeteoRepository.name);
  /**
   * Serializa o read-modify-write do fallback-meteorology.json: com o refresh
   * paralelo (Fase 3), 4 cidades lendo e gravando o mesmo arquivo ao mesmo
   * tempo perdiam atualizacoes (last-writer-wins).
   */
  private writeLock: Promise<void> = Promise.resolve();

  constructor(
    private readonly fallback: FallbackService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private get model(): string {
    return this.config.get('OPEN_METEO_MODELS', { infer: true }) || DEFAULT_METEO_MODEL;
  }

  private liveMeta(): AtmosphereData['meta'] {
    return {
      source: 'live',
      fetchedAt: new Date().toISOString(),
      dataKind: 'forecast',
      provider: 'Open-Meteo',
      model: this.model,
    };
  }

  async forceRefresh(lat: number, lon: number, locationId = 'ilha-comprida'): Promise<AtmosphereData | null> {
    this.logger.log(`Force refreshing meteorology for ${locationId} (${lat}, ${lon}, model=${this.model})...`);
    try {
      const url = buildForecastUrl(lat, lon, this.model);
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
      const data = await res.json();
      if (!data.current || typeof data.current.temperature_2m !== 'number') {
        throw new Error('Open-Meteo returned invalid current data');
      }
      const result: AtmosphereData = {
        current: data.current as CurrentData,
        hourly: data.hourly as HourlyData,
        daily: data.daily as DailyData,
        meta: this.liveMeta(),
      };
      await this.saveFallback(locationId, result);
      return result;
    } catch (err) {
      this.logger.warn(`Force refresh meteorology failed: ${err}`);
      return null;
    }
  }

  async getAtmosphereData(lat: number, lon: number, locationId: string): Promise<AtmosphereData> {
    const { data: cached, isStale } = await this.fallback.loadWithTimestamp<{
      locations: Record<string, AtmosphereData>;
    }>(FALLBACK_FILE);

    const cachedLoc = cached?.locations?.[locationId];
    if (cachedLoc) {
      // Frescor POR LOCALIDADE (meta.fetchedAt), nao do arquivo como um todo:
      // salvar 4 cidades num unico JSON nao pode mascarar a idade de uma delas.
      const fetchedAt = cachedLoc.meta?.fetchedAt ?? null;
      const locStale = fetchedAt ? this.fallback.isStale(fetchedAt) : isStale;
      if (!locStale) {
        this.logger.debug(`Using fresh fallback for ${locationId}`);
        return cachedLoc;
      }
    }

    try {
      const url = buildForecastUrl(lat, lon, this.model);
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
      const data = await res.json();

      if (!data.current || typeof data.current.temperature_2m !== 'number') {
        throw new Error('Open-Meteo returned invalid current data');
      }

      const result: AtmosphereData = {
        current: data.current as CurrentData,
        hourly: data.hourly as HourlyData,
        daily: data.daily as DailyData,
        meta: this.liveMeta(),
      };

      await this.saveFallback(locationId, result);
      this.logger.log(`Fresh data for ${locationId}: temp=${data.current.temperature_2m}°C, precip=${data.current.precipitation}mm`);
      return result;
    } catch (err) {
      this.logger.warn(`Open-Meteo API failed for ${locationId}: ${err}`);
    }

    if (cached?.locations?.[locationId]) {
      this.logger.warn(`Using stale fallback for ${locationId}`);
      const old = cached.locations[locationId];
      // Preserva fetchedAt/dataKind originais: o frescor do conteudo nao muda
      // so porque a leitura aconteceu agora (ver Backlog P2 "updatedAt enganoso").
      return {
        ...old,
        meta: { ...old.meta, source: 'stale' as const, dataKind: old.meta?.dataKind ?? 'forecast' },
      };
    }

    this.logger.warn(`No cached data for ${locationId}, using defaults`);
    return this.getDefault(locationId);
  }

  private async saveFallback(locationId: string, data: AtmosphereData): Promise<void> {
    // Fila FIFO: cada escrita espera a anterior terminar (o metodo inteiro,
    // incluindo o load, roda sob a trava — read-modify-write atomico por processo).
    const run = this.writeLock.then(() => this.doSaveFallback(locationId, data));
    this.writeLock = run.then(
      () => undefined,
      () => undefined,
    );
    await run;
  }

  private async doSaveFallback(locationId: string, data: AtmosphereData): Promise<void> {
    const { data: existing, contentAt: existingContentAt } = await this.fallback.loadWithTimestamp<{
      locations: Record<string, AtmosphereData>;
    }>(FALLBACK_FILE);
    const locations = existing?.locations ?? {};
    locations[locationId] = data;

    // contentAt do arquivo = coleta MAIS ANTIGA entre as localidades presentes.
    // Localidades legadas sem meta.fetchedAt herdam o contentAt anterior (melhor esforco),
    // de modo que o arquivo nunca anuncia frescor maior que o conteudo mais velho que guarda.
    const times = Object.values(locations).map(
      l => l.meta?.fetchedAt ?? existingContentAt ?? undefined,
    );
    const contentAt = times.find(t => typeof t === 'string')
      ? times.reduce<string | undefined>((a, b) => {
          if (!a) return b;
          if (!b) return a;
          return a < b ? a : b;
        }, undefined)
      : undefined;

    await this.fallback.save(FALLBACK_FILE, { locations }, contentAt);
  }

  /**
   * Dados SINTETICOS (media sazonal da regiao) — deterministicos (sem Math.random)
   * e marcados com meta.source='sample' para que UI/LLM nunca os apresentem como reais.
   */
  private getDefault(locationId: string): AtmosphereData {
    const now = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now);
      d.setHours(d.getHours() + i);
      return d.toISOString().slice(0, 16);
    });
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });

    const defaults: Record<string, CurrentData> = {
      'ilha-comprida': {
        temperature_2m: 21.5, relative_humidity_2m: 82, apparent_temperature: 20.8,
        precipitation: 0, weather_code: 2, wind_speed_10m: 14.3,
        wind_direction_10m: 110, surface_pressure: 1018.2,
      },
      'iguape': {
        temperature_2m: 22.0, relative_humidity_2m: 80, apparent_temperature: 21.2,
        precipitation: 0, weather_code: 2, wind_speed_10m: 12.8,
        wind_direction_10m: 105, surface_pressure: 1017.9,
      },
      'cananeia': {
        temperature_2m: 20.8, relative_humidity_2m: 85, apparent_temperature: 20.1,
        precipitation: 0.2, weather_code: 3, wind_speed_10m: 16.1,
        wind_direction_10m: 120, surface_pressure: 1018.5,
      },
      'registro': {
        temperature_2m: 23.2, relative_humidity_2m: 75, apparent_temperature: 22.5,
        precipitation: 0, weather_code: 1, wind_speed_10m: 10.5,
        wind_direction_10m: 90, surface_pressure: 1017.0,
      },
    };

    const base = defaults[locationId] ?? defaults['ilha-comprida'];
    // Rajada sintetica deterministica (~1.4x vento medio), ja que o campo existe no contrato.
    const current: CurrentData = { ...base, wind_gusts_10m: +(base.wind_speed_10m * 1.4).toFixed(1) };

    // Curvas deterministicas (oscilacao simples por indice) — nada de Math.random:
    // um "forecast" sintetico aleatorio passaria por dado real em qualquer tela.
    const wobble = (base: number, amp: number, i: number): number =>
      +(base + Math.sin(i * 0.9) * amp).toFixed(1);

    return {
      current,
      hourly: {
        time: hours,
        temperature_2m: hours.map((_, i) => wobble(current.temperature_2m, 2, i)),
        relative_humidity_2m: hours.map((_, i) => Math.min(100, Math.max(30, Math.round(current.relative_humidity_2m + Math.sin(i * 0.7) * 10)))),
        precipitation_probability: hours.map((_, i) => Math.round(Math.abs(Math.sin(i * 0.5)) * 40)),
        precipitation: hours.map((_, i) => Math.abs(Math.sin(i * 0.6)) < 0.3 ? 0 : +(Math.abs(Math.sin(i * 0.6))).toFixed(1)),
        weather_code: hours.map(() => current.weather_code),
        wind_speed_10m: hours.map((_, i) => wobble(current.wind_speed_10m, 3, i)),
        wind_gusts_10m: hours.map((_, i) => wobble(current.wind_speed_10m * 1.4, 4, i)),
        cloud_cover: hours.map((_, i) => Math.round(Math.abs(Math.sin(i * 0.4)) * 70 + 10)),
        visibility: hours.map((_, i) => Math.round(9000 + Math.abs(Math.sin(i * 0.3)) * 10000)),
      },
      daily: {
        time: days,
        temperature_2m_max: days.map((_, i) => wobble(current.temperature_2m + 4, 1.5, i)),
        temperature_2m_min: days.map((_, i) => wobble(current.temperature_2m - 4, 1, i)),
        precipitation_sum: days.map((_, i) => +(Math.abs(Math.sin(i * 0.8)) * 10).toFixed(1)),
        precipitation_probability_max: days.map((_, i) => Math.round(Math.abs(Math.sin(i * 0.6)) * 60)),
        wind_speed_10m_max: days.map((_, i) => wobble(current.wind_speed_10m + 5, 2, i)),
        weather_code: days.map(() => current.weather_code),
        sunrise: days.map(d => `${d}T06:15`),
        sunset: days.map(d => `${d}T18:05`),
        uv_index_max: days.map(() => 5),
      },
      meta: { source: 'sample', dataKind: 'sample', provider: 'synthetic' },
    };
  }
}
