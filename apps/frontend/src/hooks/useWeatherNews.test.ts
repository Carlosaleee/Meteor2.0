import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWeatherNews } from './useWeatherNews';

vi.mock('@/lib/api', () => ({
  fetchAPI: vi.fn(),
}));

describe('useWeatherNews', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useWeatherNews());
    expect(result.current.loading).toBe(true);
  });

  it('should return data on success', async () => {
    const mockData = {
      news: [{ id: '1', cityId: 'ilha-comprida', title: 'Alerta', source: 'INMET', type: 'alerta', url: 'https://test.com', publishedAt: new Date().toISOString() }],
      timestamp: new Date().toISOString(),
    };
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useWeatherNews());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('should handle errors', async () => {
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useWeatherNews());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
  });

  it('should pass cityId to API', async () => {
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockResolvedValueOnce({ news: [], timestamp: '' });

    renderHook(() => useWeatherNews('iguape'));

    await waitFor(() => {
      expect(fetchAPI).toHaveBeenCalledWith('/v1/meteorology/news?cityId=iguape');
    });
  });

  it('should not include cityId when undefined', async () => {
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockResolvedValueOnce({ news: [], timestamp: '' });

    renderHook(() => useWeatherNews());

    await waitFor(() => {
      expect(fetchAPI).toHaveBeenCalledWith('/v1/meteorology/news');
    });
  });
});
