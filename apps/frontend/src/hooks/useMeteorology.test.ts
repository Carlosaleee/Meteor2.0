import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMeteorology } from './useMeteorology';

vi.mock('@/lib/api', () => ({
  fetchAPI: vi.fn(),
}));

describe('useMeteorology', () => {
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
});
