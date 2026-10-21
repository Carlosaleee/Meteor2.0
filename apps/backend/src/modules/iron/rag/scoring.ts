const STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'em', 'no',
  'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'sob', 'e', 'ou', 'que', 'se',
  'ao', 'à', 'é', 'ser', 'tem', 'está', 'estao', 'estao', 'como', 'qual', 'quais',
  'quem', 'quando', 'onde', 'the', 'of', 'in', 'is', 'are', 'to', 'and',
]);

/** Normaliza texto: minúsculas, sem acentos, tokens alfanuméricos. */
export function tokenize(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * BM25 (Okapi) — pontuação lexical. Sem dependências externas.
 */
export function bm25Score(
  queryTokens: string[],
  docTokens: string[],
  docFreqs: Map<string, number>,
  totalDocs: number,
  avgDocLen: number,
  k1 = 1.2,
  b = 0.75,
): number {
  if (queryTokens.length === 0 || docTokens.length === 0) return 0;

  const tf = new Map<string, number>();
  for (const t of docTokens) tf.set(t, (tf.get(t) ?? 0) + 1);

  let score = 0;
  const docLen = docTokens.length;
  const uniqueQuery = new Set(queryTokens);

  for (const term of uniqueQuery) {
    const termTf = tf.get(term) ?? 0;
    if (termTf === 0) continue;

    const df = docFreqs.get(term) ?? 0;
    const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
    const norm = termTf * (k1 + 1) / (termTf + k1 * (1 - b + b * docLen / avgDocLen));
    score += idf * norm;
  }
  return score;
}

/** Similaridade de cosseno entre dois vetores; 0 quando dimensões divergem. */
export function cosineSimilarity(a: number[] | undefined, b: number[] | undefined): number {
  if (!a || !b || a.length === 0 || a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
