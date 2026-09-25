'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI, type NewsResponse } from '@/lib/api';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useNews() {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const result = await fetchAPI<NewsResponse>('/v1/news');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      void fetchData(false);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const refetch = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
