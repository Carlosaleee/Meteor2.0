'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI, type MeteorologyResponse } from '@/lib/api';

const CITY_IDS = ['ilha-comprida', 'iguape', 'cananeia', 'registro'] as const;

type CityId = typeof CITY_IDS[number];

type CitySummary = {
  locationId: string;
  location: string;
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
};

type UseAllCitiesResult = {
  cities: Record<CityId, CitySummary | null>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

const EMPTY: Record<CityId, CitySummary | null> = {
  'ilha-comprida': null,
  'iguape': null,
  'cananeia': null,
  'registro': null,
};

export function useAllCities(): UseAllCitiesResult {
  const [cities, setCities] = useState<Record<CityId, CitySummary | null>>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        CITY_IDS.map(id =>
          fetchAPI<MeteorologyResponse>(`/v1/meteorology?locationId=${id}`)
            .then(data => ({
              locationId: id,
              location: data.location,
              temperature: data.current.temperature,
              weatherCode: data.current.weatherCode,
              humidity: data.current.humidity,
              windSpeed: data.current.windSpeed,
            }))
            .catch(() => null)
        )
      );

      const map: Record<CityId, CitySummary | null> = { ...EMPTY };
      CITY_IDS.forEach((id, i) => {
        map[id] = results[i];
      });
      setCities(map);
    } catch {
      setError('Erro ao buscar dados das cidades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { cities, loading, error, refetch: fetchAll };
}
