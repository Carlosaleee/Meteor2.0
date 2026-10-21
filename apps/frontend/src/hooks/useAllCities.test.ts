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
      daily: [
        {
          date: '2026-10-21',
          tempMax: 29,
          tempMin: 18,
          precipitationSum: 0,
          precipitationProbabilityMax: 10,
          windSpeedMax: 20,
          weatherCode: 2,
          sunrise: '2026-10-21T05:40:00-03:00',
          sunset: '2026-10-21T18:20:00-03:00',
          uvIndexMax: 7,
        },
      ],
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
      tempMax: 29,
      tempMin: 18,
      forecastCode: 2,
    });
  });

  it('should return null daily fields when daily is empty', async () => {
    const mockResponse = {
      location: 'Iguape',
      locationId: 'iguape',
      current: { temperature: 22, humidity: 60, windSpeed: 8, weatherCode: 3 },
      hourly: [],
      daily: [],
    };
    const { fetchAPI } = await import('@/lib/api');
    vi.mocked(fetchAPI).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAllCities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cities['iguape']).toMatchObject({
      tempMax: null,
      tempMin: null,
      forecastCode: null,
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
