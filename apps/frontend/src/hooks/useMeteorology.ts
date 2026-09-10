'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI, type MeteorologyResponse } from '@/lib/api';

type UseMeteorologyResult = {
  data: MeteorologyResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useMeteorology(locationId: string): UseMeteorologyResult {
  const [data, setData] = useState<MeteorologyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAPI<MeteorologyResponse>(
        `/v1/meteorology?locationId=${locationId}`,
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados meteorológicos');
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
