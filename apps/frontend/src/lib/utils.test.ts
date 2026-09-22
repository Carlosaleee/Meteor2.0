import { describe, it, expect } from 'vitest';
import { timeAgo, windDirectionLabel, CATEGORY_CONFIG, ROUTE_CONDITION_COLORS } from './utils';

describe('timeAgo', () => {
  it('should return minutes for recent dates', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe('5min');
  });

  it('should return hours for dates within 24h', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('3h');
  });

  it('should return days for older dates', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe('2d');
  });
});

describe('windDirectionLabel', () => {
  it('should return N for 0 degrees', () => {
    expect(windDirectionLabel(0)).toBe('N');
  });

  it('should return NE for 45 degrees', () => {
    expect(windDirectionLabel(45)).toBe('NE');
  });

  it('should return E for 90 degrees', () => {
    expect(windDirectionLabel(90)).toBe('E');
  });

  it('should return S for 180 degrees', () => {
    expect(windDirectionLabel(180)).toBe('S');
  });

  it('should return W for 270 degrees', () => {
    expect(windDirectionLabel(270)).toBe('W');
  });
});

describe('CATEGORY_CONFIG', () => {
  it('should have all required categories', () => {
    expect(CATEGORY_CONFIG.todas).toBeDefined();
    expect(CATEGORY_CONFIG.transito).toBeDefined();
    expect(CATEGORY_CONFIG.noticia).toBeDefined();
    expect(CATEGORY_CONFIG.policial).toBeDefined();
    expect(CATEGORY_CONFIG.turismo).toBeDefined();
    expect(CATEGORY_CONFIG.cotidiano).toBeDefined();
  });

  it('should have label and emoji for each category', () => {
    for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
      expect(config.label).toBeTruthy();
      expect(config.emoji).toBeTruthy();
    }
  });
});

describe('ROUTE_CONDITION_COLORS', () => {
  it('should map conditions to colors', () => {
    expect(ROUTE_CONDITION_COLORS.LIVRE).toBe('#22c55e');
    expect(ROUTE_CONDITION_COLORS.MODERADO).toBe('#eab308');
    expect(ROUTE_CONDITION_COLORS.LENTO).toBe('#f97316');
    expect(ROUTE_CONDITION_COLORS.BLOQUEADO).toBe('#ef4444');
  });
});
