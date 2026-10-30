import { parseEnv } from './env.schema';

describe('parseEnv', () => {
  it('applies schema defaults for absent variables', () => {
    const result = parseEnv({});

    expect(result.PORT).toBe(3001);
    expect(result.FRONTEND_ORIGIN).toBe('http://localhost:3000');
    expect(result.NODE_ENV).toBe('development');
    expect(result.FALLBACK_DIR).toBe('data');
    expect(result.OPEN_METEO_MODELS).toBe('best_match');
    expect(result.GEMINI_MODEL).toBe('gemini-flash-latest');
    expect(result.GEMINI_EMBEDDING_MODEL).toBe('gemini-embedding-2');
    expect(result.GEMINI_EMBEDDING_DIMS).toBe(128);
  });

  it('coerces declared variables to their schema types', () => {
    const result = parseEnv({ PORT: '4000', FALLBACK_MAX_AGE_HOURS: '12', OPEN_METEO_MODELS: 'icon_dwd', GEMINI_EMBEDDING_DIMS: '256' });

    expect(result.PORT).toBe(4000);
    expect(result.FALLBACK_MAX_AGE_HOURS).toBe(12);
    expect(result.OPEN_METEO_MODELS).toBe('icon_dwd');
    expect(result.GEMINI_EMBEDDING_DIMS).toBe(256);
    expect(typeof result.PORT).toBe('number');
  });

  it('keeps variables that are not declared in the Zod schema', () => {
    const result = parseEnv({
      PORT: '3001',
      CRON_SECRET: 'my-own-secret',
      GITHUB_OWNER: 'Carlosaleee',
      GITHUB_REPO: 'Meteor2.0',
      VERCEL_TOKEN_BACKEND: 'vbr_xxx',
    });

    expect(result.CRON_SECRET).toBe('my-own-secret');
    expect(result.GITHUB_OWNER).toBe('Carlosaleee');
    expect(result.GITHUB_REPO).toBe('Meteor2.0');
    expect(result.VERCEL_TOKEN_BACKEND).toBe('vbr_xxx');
  });

  it('exposes undeclared variables to the process.env publisher of ConfigModule', () => {
    const parsed = parseEnv({ CRON_SECRET: 'publish-me' });

    const published: NodeJS.ProcessEnv = {};
    Object.keys(parsed)
      .filter(key => !(key in process.env))
      .forEach(key => (published[key] = String(parsed[key])));

    expect(published.CRON_SECRET).toBe('publish-me');
  });

  it('accepts a comma-separated list of origins', () => {
    const result = parseEnv({
      FRONTEND_ORIGIN: 'https://meteor2-0-frontend.vercel.app,https://preview-abc123.vercel.app',
    });

    expect(result.FRONTEND_ORIGIN).toBe(
      'https://meteor2-0-frontend.vercel.app,https://preview-abc123.vercel.app',
    );
  });

  it('rejects invalid declared values', () => {
    expect(() => parseEnv({ PORT: '-1' })).toThrow();
    expect(() => parseEnv({ FRONTEND_ORIGIN: 'not-a-url' })).toThrow();
    expect(() => parseEnv({ FRONTEND_ORIGIN: 'https://ok.example.com,,https://bad.example.com' })).toThrow();
    expect(() => parseEnv({ NODE_ENV: 'staging' })).toThrow();
  });
});
