'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI, type NewsResponse } from '@/lib/api';

export function useNews() {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
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
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
