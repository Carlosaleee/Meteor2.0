'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '@/lib/api';

export type WeatherNewsItem = {
  id: string;
  cityId: string;
  title: string;
  source: string;
  type: 'alerta' | 'informe' | 'boletim';
  url: string;
  publishedAt: string;
};

export type WeatherNewsResponse = {
  news: WeatherNewsItem[];
  timestamp: string;
};

type UseWeatherNewsResult = {
  data: WeatherNewsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useWeatherNews(cityId?: string): UseWeatherNewsResult {
  const [data, setData] = useState<WeatherNewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = cityId ? `?cityId=${cityId}` : '';
      const result = await fetchAPI<WeatherNewsResponse>(`/v1/meteorology/news${query}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar notícias meteorológicas');
    } finally {
      setLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
