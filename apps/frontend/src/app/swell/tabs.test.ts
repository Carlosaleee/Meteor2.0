import { describe, it, expect } from 'vitest';
import { resolveSwellTab, DEFAULT_SWELL_TAB, SWELL_TABS } from './tabs';

describe('resolveSwellTab', () => {
  it('should accept every valid swell tab', () => {
    for (const tab of SWELL_TABS) {
      expect(resolveSwellTab(tab)).toBe(tab);
    }
  });

  it('should fall back to overview for an invalid tab', () => {
    expect(resolveSwellTab('inexistente')).toBe('overview');
    expect(resolveSwellTab('')).toBe('overview');
    expect(resolveSwellTab('NEWX')).toBe('overview');
  });

  it('should keep the current tab when no query is present', () => {
    expect(resolveSwellTab(null)).toBe(DEFAULT_SWELL_TAB);
    expect(resolveSwellTab(null, 'news')).toBe('news');
  });
});
