'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI, type AiSummaryResponse } from '@/lib/api';

type UseAiSummaryResult = {
  data: AiSummaryResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useAiSummary(): UseAiSummaryResult {
  const [data, setData] = useState<AiSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAPI<AiSummaryResponse>('/v1/oceanography/summary');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar resumo IA');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
