import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSwell } from './useSwell';

vi.mock('@/lib/api', () => ({
  fetchAPI: vi.fn(),
}));

describe('useSwell', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useSwell());
    expect(result.current.loading).toBe(true);
  });

  it('should return data on success', async () => {
    const mockData = {
      current: { waveHeight: 1.2, wavePeriod: 10, waveDirection: 150 },
      qualityLabel: 'Boas',
      bestTime: '08:00 - 11:00',
      nextTide: '14:30',
    };
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useSwell());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('should handle errors', async () => {
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockRejectedValueOnce(new Error('API fail'));

    const { result } = renderHook(() => useSwell());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API fail');
  });
});
