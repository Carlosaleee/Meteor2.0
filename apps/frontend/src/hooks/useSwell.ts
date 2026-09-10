'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI, type OceanographyResponse } from '@/lib/api';

type UseSwellResult = {
  data: OceanographyResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useSwell(): UseSwellResult {
  const [data, setData] = useState<OceanographyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAPI<OceanographyResponse>('/v1/oceanography');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados oceânicos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
