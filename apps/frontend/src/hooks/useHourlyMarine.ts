'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI, type HourlyMarineResponse } from '@/lib/api';

type UseHourlyMarineResult = {
  data: HourlyMarineResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useHourlyMarine(): UseHourlyMarineResult {
  const [data, setData] = useState<HourlyMarineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAPI<HourlyMarineResponse>('/v1/oceanography/hourly');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados hourly');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
