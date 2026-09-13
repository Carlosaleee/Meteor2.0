import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useComercio } from './useComercio';

vi.mock('@/lib/api', () => ({
  fetchAPI: vi.fn(),
}));

describe('useComercio', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useComercio());
    expect(result.current.loading).toBe(true);
  });

  it('should return data on success', async () => {
    const mockData = { commerce: [{ id: '1', name: 'Teste' }], timestamp: new Date().toISOString() };
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useComercio());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle errors', async () => {
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useComercio());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('API Error');
  });
});
