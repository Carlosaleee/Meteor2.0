import { buildForecastUrl } from './open-meteo.repository';

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
