'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI, type LocalismoResponse } from '@/lib/api';

type UseLocalismoResult = {
  data: LocalismoResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useLocalismo(): UseLocalismoResult {
  const [data, setData] = useState<LocalismoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAPI<LocalismoResponse>('/v1/localismo');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados de localismo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
