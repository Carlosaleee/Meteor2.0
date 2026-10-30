import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { fetchAPI } from '@/lib/api';
import { useMeteorology } from './useMeteorology';

vi.mock('@/lib/api', () => ({
  fetchAPI: vi.fn(),
}));

describe('useMeteorology', () => {
  beforeEach(() => {
    vi.mocked(fetchAPI).mockReset();
    vi.mocked(fetchAPI).mockReturnValue(new Promise(() => {}));
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useMeteorology('ilha-comprida'));
    expect(result.current.loading).toBe(true);
  });

  it('should return data on success', async () => {
    const mockData = {
      location: 'Ilha Comprida',
      locationId: 'ilha-comprida',
      current: { temperature: 25, humidity: 70, windSpeed: 12, weatherCode: 1 },
      hourly: [],
      daily: [],
    };
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useMeteorology('ilha-comprida'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('should handle errors', async () => {
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMeteorology('ilha-comprida'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('should preserve stale payload with real age (MET-03: badge precisa dos campos)', async () => {
    const staleData = {
      location: 'Iguape',
      locationId: 'iguape',
      timestamp: '2026-10-30T14:00:00.000Z',
      source: 'stale' as const,
      timezone: 'America/Sao_Paulo',
      fetchedAt: '2026-10-27T10:00:00.000Z',
      ageHours: 76,
      meta: { dataKind: 'forecast' as const, provider: 'Open-Meteo', model: 'best_match' },
      current: { temperature: 20, humidity: 80, windSpeed: 10, weatherCode: 1 },
      hourly: [],
      daily: [],
    };
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockResolvedValueOnce(staleData);

    const { result } = renderHook(() => useMeteorology('iguape'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // o hook entrega o payload como veio — fonte de proveniencia intacta
    expect(result.current.data?.source).toBe('stale');
    expect(result.current.data?.ageHours).toBe(76);
    expect(result.current.data?.fetchedAt).toBe('2026-10-27T10:00:00.000Z');
  });

  it('should refetch when locationId changes', async () => {
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockResolvedValue({
      location: 'Registro', locationId: 'registro',
      current: { temperature: 23, humidity: 75, windSpeed: 13, weatherCode: 1 },
      hourly: [], daily: [],
    });

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useMeteorology(id),
      { initialProps: { id: 'ilha-comprida' } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ id: 'registro' });
    await waitFor(() => expect(result.current.data?.locationId).toBe('registro'));
    expect(vi.mocked(fetchAPI).mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
