import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAPI } from './api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('fetchAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { temperature: 25 } }),
    });

    const result = await fetchAPI('/v1/weather');
    expect(result).toEqual({ temperature: 25 });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/v1/weather',
      { cache: 'no-store' },
    );
  });

  it('should throw on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(fetchAPI('/v1/weather')).rejects.toThrow('API error: 500');
  });

  it('should handle envelope error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, error: { message: 'Not found' } }),
    });

    await expect(fetchAPI('/v1/missing')).rejects.toThrow('Not found');
  });

  it('should return json directly when no data wrapper', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' }),
    });

    const result = await fetchAPI('/v1/health');
    expect(result).toEqual({ status: 'ok' });
  });
});
