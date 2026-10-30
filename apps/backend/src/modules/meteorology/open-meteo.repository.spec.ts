import { OpenMeteoRepository, buildForecastUrl } from './open-meteo.repository';
import { FallbackService } from '../../common/fallback/fallback.service';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../common/config/env.schema';

jest.mock('../../common/http/fetch-timeout', () => ({
  fetchWithTimeout: jest.fn(),
}));

import { fetchWithTimeout } from '../../common/http/fetch-timeout';

const mockFetch = jest.mocked(fetchWithTimeout);

const validPayload = (temp: number) => ({
  current: {
    temperature_2m: temp, apparent_temperature: temp - 1, relative_humidity_2m: 70,
    precipitation: 0, weather_code: 1, wind_speed_10m: 10, wind_gusts_10m: 15,
    wind_direction_10m: 90, surface_pressure: 1013,
  },
  hourly: {
    time: [], temperature_2m: [], relative_humidity_2m: [], precipitation_probability: [],
    precipitation: [], weather_code: [], wind_speed_10m: [], cloud_cover: [], visibility: [],
  },
  daily: {
    time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [],
    precipitation_probability_max: [], wind_speed_10m_max: [], weather_code: [],
    sunrise: [], sunset: [], uv_index_max: [],
  },
});

const staleLoc = {
  current: {
    temperature_2m: 19, apparent_temperature: 19, relative_humidity_2m: 80,
    wind_speed_10m: 8, wind_direction_10m: 45, surface_pressure: 1015,
    precipitation: 0, weather_code: 2,
  },
  hourly: { time: [], temperature_2m: [], relative_humidity_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], cloud_cover: [], visibility: [] },
  daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [], weather_code: [], sunrise: [], sunset: [], uv_index_max: [] },
  meta: { source: 'live' as const, fetchedAt: '2026-10-25T10:00:00.000Z', dataKind: 'forecast' as const },
};

type LoadResult = {
  data: { locations: Record<string, typeof staleLoc> } | null;
  updatedAt: string | null;
  contentAt: string | null;
  isStale: boolean;
};

function makeRepo(overrides: {
  load?: () => Promise<LoadResult>;
  isStale?: (t: string | null) => boolean;
} = {}) {
  const fallback = {
    loadWithTimestamp: jest.fn(async () =>
      overrides.load ? overrides.load() : ({ data: null, updatedAt: null, contentAt: null, isStale: true } as LoadResult),
    ),
    save: jest.fn().mockResolvedValue(undefined),
    isStale: jest.fn((t: string | null) => (overrides.isStale ? overrides.isStale(t) : true)),
  };
  const config = {
    get: jest.fn((key: string) => (key === 'OPEN_METEO_MODELS' ? 'best_match' : undefined)),
  };
  const repo = new OpenMeteoRepository(
    fallback as unknown as FallbackService,
    config as unknown as ConfigService<Env, true>,
  );
  return { repo, fallback, config };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('buildForecastUrl', () => {
  const url = buildForecastUrl(-24.11, -47.77, 'best_match');

  it('should target the forecast endpoint with effective coordinates', () => {
    expect(url).toContain('https://api.open-meteo.com/v1/forecast');
    expect(url).toContain('latitude=-24.11');
    expect(url).toContain('longitude=-47.77');
  });

  it('should pin the effective model (MET-04)', () => {
    expect(url).toContain('models=best_match');
    const custom = buildForecastUrl(-24.11, -47.77, 'icon_dwd');
    expect(custom).toContain('models=icon_dwd');
    // modelo customizado nao vaza para outra query
    expect(url).not.toContain('icon_dwd');
  });

  it('should request wind gusts in current and hourly (MET-05)', () => {
    expect(url).toContain('wind_gusts_10m');
    expect(url.match(/wind_gusts_10m/g)?.length).toBe(2);
  });

  it('should keep the SP timezone and 7-day horizon', () => {
    expect(url).toContain('timezone=America/Sao_Paulo');
    expect(url).toContain('forecast_days=7');
  });
});

describe('OpenMeteoRepository — getAtmosphereData (ciclo de vida do fallback)', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('cenario 1: cache fresco NAO chama a API (evita rate-limit)', async () => {
    const { repo, fallback } = makeRepo({
      load: async () => ({ data: { locations: { 'ilha-comprida': staleLoc } }, updatedAt: 'x', contentAt: 'x', isStale: false }),
      isStale: () => false,
    });

    const out = await repo.getAtmosphereData(-24.73, -47.55, 'ilha-comprida');

    expect(out.current.temperature_2m).toBe(19);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('cenario 2: cache fresco no arquivo MAS antigo por localidade -> busca na API', async () => {
    const { repo } = makeRepo({
      // arquivo "fresco" (escrito agora), mas o conteudo desta cidade foi coletado ha 3 dias
      load: async () => ({ data: { locations: { 'ilha-comprida': staleLoc } }, updatedAt: new Date().toISOString(), contentAt: new Date().toISOString(), isStale: false }),
      isStale: () => true, // meta.fetchedAt de 25/10 -> stale
    });
    mockFetch.mockResolvedValue({ ok: true, json: async () => validPayload(22) } as Response);

    const out = await repo.getAtmosphereData(-24.73, -47.55, 'ilha-comprida');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(out.meta?.source).toBe('live');
  });

  it('cenario 3: API fora do ar + cache -> stale preservando fetchedAt original (MET-03)', async () => {
    const { repo } = makeRepo({
      load: async () => ({ data: { locations: { 'ilha-comprida': staleLoc } }, updatedAt: 'old', contentAt: 'old', isStale: true }),
    });
    mockFetch.mockRejectedValue(new Error('ETIMEDOUT'));

    const out = await repo.getAtmosphereData(-24.73, -47.55, 'ilha-comprida');

    expect(out.meta?.source).toBe('stale');
    // a idade REAL do conteudo nao muda so porque a leitura falhou agora
    expect(out.meta?.fetchedAt).toBe('2026-10-25T10:00:00.000Z');
    expect(out.meta?.dataKind).toBe('forecast');
    expect(out.current.temperature_2m).toBe(19);
  });

  it('cenario 4: resposta invalida da API (sem current numerico) cai para stale, nao vira erro 500', async () => {
    const { repo } = makeRepo({
      load: async () => ({ data: { locations: { 'ilha-comprida': staleLoc } }, updatedAt: 'old', contentAt: 'old', isStale: true }),
    });
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ foo: 'bar' }) } as Response);

    const out = await repo.getAtmosphereData(-24.73, -47.55, 'ilha-comprida');
    expect(out.meta?.source).toBe('stale');
    expect(out.current.temperature_2m).toBe(19);
  });

  it('cenario 5: API fora do ar + SEM cache -> sample deterministico marcado como sintetico', async () => {
    const { repo } = makeRepo();
    mockFetch.mockRejectedValue(new Error('ENOTFOUND'));

    const a = await repo.getAtmosphereData(-24.73, -47.55, 'ilha-comprida');
    const b = await repo.getAtmosphereData(-24.73, -47.55, 'ilha-comprida');

    expect(a.meta?.source).toBe('sample');
    expect(a.meta?.dataKind).toBe('sample');
    expect(a.meta?.provider).toBe('synthetic');
    expect(a.meta?.fetchedAt).toBeUndefined();
    // determinismo: duas chamadas identicas (nada de Math.random)
    expect(a).toEqual(b);
  });

  it('cenario 6: HTTP 500 da API cai para stale', async () => {
    const { repo } = makeRepo({
      load: async () => ({ data: { locations: { 'ilha-comprida': staleLoc } }, updatedAt: 'old', contentAt: 'old', isStale: true }),
    });
    mockFetch.mockResolvedValue({ ok: false, status: 500 } as Response);

    const out = await repo.getAtmosphereData(-24.73, -47.55, 'ilha-comprida');
    expect(out.meta?.source).toBe('stale');
  });
});

describe('OpenMeteoRepository — forceRefresh', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('deve devolver null quando a fonte falha (sem lancar)', async () => {
    const { repo } = makeRepo();
    mockFetch.mockRejectedValue(new Error('boom'));
    await expect(repo.forceRefresh(-24.73, -47.55, 'iguape')).resolves.toBeNull();
  });

  it('deve salvar com meta live + fetchedAt e contentAt preservado no arquivo', async () => {
    let file: LoadResult = { data: null, updatedAt: null, contentAt: null, isStale: true };
    const { repo, fallback } = makeRepo({
      load: async () => file,
    });
    fallback.save.mockImplementation(async (_n: string, data: unknown, contentAt?: string) => {
      await sleep(5);
      file = { data: data as LoadResult['data'], updatedAt: new Date().toISOString(), contentAt: contentAt ?? null, isStale: false };
    });
    mockFetch.mockResolvedValue({ ok: true, json: async () => validPayload(23) } as Response);

    const out = await repo.forceRefresh(-24.73, -47.55, 'cananeia');

    expect(out?.meta?.source).toBe('live');
    expect(out?.meta?.fetchedAt).toBeDefined();
    expect(fallback.save).toHaveBeenCalledTimes(1);
    // save recebeu contentAt (coleta) — nao so updatedAt
    expect(fallback.save.mock.calls[0][2]).toBe(out?.meta?.fetchedAt);
    expect(file.data?.locations?.['cananeia']).toBeDefined();
  });

  it('cenario 7 (Fase 3): 2 refreshes concorrentes nao perdem cidades (writeLock)', async () => {
    let file: LoadResult = { data: null, updatedAt: null, contentAt: null, isStale: true };
    const { repo, fallback } = makeRepo({ load: async () => file });
    fallback.save.mockImplementation(async (_n: string, data: unknown, contentAt?: string) => {
      await sleep(20); // janela em que, sem a trava, o 2o save sobrescreveria o 1o
      file = { data: data as LoadResult['data'], updatedAt: new Date().toISOString(), contentAt: contentAt ?? null, isStale: false };
    });
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => validPayload(21) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => validPayload(24) } as Response);

    await Promise.all([
      repo.forceRefresh(-24.73, -47.55, 'ilha-comprida'),
      repo.forceRefresh(-24.48, -47.84, 'registro'),
    ]);

    expect(Object.keys(file.data?.locations ?? {}).sort()).toEqual(['ilha-comprida', 'registro']);
  });
});
