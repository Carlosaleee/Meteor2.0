import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAllCities } from './useAllCities';

vi.mock('@/lib/api', () => ({
  fetchAPI: vi.fn(),
}));

describe('useAllCities', () => {
  it('should return cities on success', async () => {
    const mockResponse = {
      location: 'Ilha Comprida',
      locationId: 'ilha-comprida',
      current: { temperature: 25, humidity: 70, windSpeed: 12, weatherCode: 1 },
      hourly: [],
      daily: [],
    };
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAllCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities['ilha-comprida']).toEqual({
      locationId: 'ilha-comprida',
      location: 'Ilha Comprida',
      temperature: 25,
      weatherCode: 1,
      humidity: 70,
      windSpeed: 12,
    });
  });

  it('should handle per-city fetch failures gracefully', async () => {
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockRejectedValue(new Error('API fail'));

    const { result } = renderHook(() => useAllCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities['ilha-comprida']).toBeNull();
    expect(result.current.cities['iguape']).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
