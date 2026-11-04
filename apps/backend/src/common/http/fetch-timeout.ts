/**
 * fetch com timeout obrigatorio — a API nativa de fetch do Node nao tem timeout
 * padrao: uma chamada pendurada seguraria o RefreshService com `isRefreshing=true`
 * para sempre e queimaria o `maxDuration` da Vercel.
 */
const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS,
): Promise<Response> {
  return fetch(url, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(timeoutMs),
  });
}
