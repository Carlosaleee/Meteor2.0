'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '@/lib/api';

export type RegionalNewsItem = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  url: string;
  description: string;
  image: string;
  category: 'noticia' | 'transito' | 'policial' | 'turismo' | 'cotidiano';
  publishedAt: string;
};

export type TrafficRoute = {
  id: string;
  name: string;
  condition: string;
  description: string;
  updatedAt: string;
};

export type RegionalNewsResponse = {
  news: RegionalNewsItem[];
  routes: TrafficRoute[];
  timestamp: string;
};

type UseRegionalNewsResult = {
  data: RegionalNewsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useRegionalNews(): UseRegionalNewsResult {
  const [data, setData] = useState<RegionalNewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const result = await fetchAPI<RegionalNewsResponse>('/v1/noticias-regionais');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar noticias regionais');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      void fetchData(false);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData() };
}
