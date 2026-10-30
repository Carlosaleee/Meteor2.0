import { describe, it, expect } from 'vitest';
import { weatherDescription, weatherEmoji, windDirection, formatHour, formatDay } from './weather-utils';

describe('weatherDescription', () => {
  it('mapeia codigos WMO comuns', () => {
    expect(weatherDescription(0)).toBe('Céu limpo');
    expect(weatherDescription(63)).toBe('Chuva moderada');
  });

  it('codigos extremos (tempestade/granizo) tem descricao propria', () => {
    expect(weatherDescription(95)).toBe('Tempestade');
    expect(weatherDescription(96)).toBe('Tempestade com granizo leve');
    expect(weatherDescription(99)).toBe('Tempestade com granizo forte');
  });

  it('codigo desconhecido cai para indisponivel, nunca vazio', () => {
    expect(weatherDescription(999)).toBe('Dados indisponíveis');
    expect(weatherDescription(-1)).toBe('Dados indisponíveis');
    expect(weatherDescription(Number.NaN)).toBe('Dados indisponíveis');
  });
});

describe('weatherEmoji', () => {
  it('faixas WMO corretas', () => {
    expect(weatherEmoji(0)).toBe('☀️');
    expect(weatherEmoji(3)).toBe('☁️');
    expect(weatherEmoji(45)).toBe('🌫️');
    expect(weatherEmoji(65)).toBe('🌧️');
    expect(weatherEmoji(75)).toBe('❄️');
    expect(weatherEmoji(99)).toBe('⛈️');
  });

  it('codigo fora de qualquer faixa usa termometro neutro', () => {
    expect(weatherEmoji(4)).toBe('🌡️');   // entre 3 e 45 (nao mapeado)
    expect(weatherEmoji(49)).toBe('🌡️');  // entre 48 e 51
    expect(weatherEmoji(999)).toBe('⛈️'); // >= 95 herda a faixa de tempestade
  });
});

describe('windDirection', () => {
  it('graus cardinais', () => {
    expect(windDirection(0)).toBe('N');
    expect(windDirection(90)).toBe('E');
    expect(windDirection(180)).toBe('S');
    expect(windDirection(270)).toBe('W');
  });

  it('360 graus volta para N (borda superior)', () => {
    expect(windDirection(360)).toBe('N');
  });

  it('valores negativos nao quebram (borda inferior)', () => {
    expect(windDirection(-1)).toBe('N');
  });
});

describe('formatHour / formatDay', () => {
  it('formatHour renderiza HHh', () => {
    expect(formatHour('2026-10-30T09:00:00')).toBe('09h');
    expect(formatHour('2026-10-30T23:00:00')).toBe('23h');
  });

  it('formatDay renderiza dia da semana em PT', () => {
    // 2026-10-30 e uma sexta-feira
    expect(formatDay('2026-10-30')).toBe('Sex');
  });

  it('formatDay com data invalida nao lanca excecao', () => {
    expect(() => formatDay('nao-e-data')).not.toThrow();
  });
});
