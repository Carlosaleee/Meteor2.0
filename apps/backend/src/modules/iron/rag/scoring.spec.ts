import { tokenize, bm25Score, cosineSimilarity } from './scoring';

describe('scoring', () => {
  describe('tokenize', () => {
    it('should lowercase and strip accents', () => {
      expect(tokenize('Previsão do TEMPO em Cananéia')).toContain('previsao');
      expect(tokenize('Previsão do TEMPO em Cananéia')).toContain('cananeia');
    });

    it('should drop stopwords and short tokens', () => {
      const tokens = tokenize('a o de como está o clima');
      expect(tokens).not.toContain('a');
      expect(tokens).not.toContain('de');
      expect(tokens).toContain('clima');
    });
  });

  describe('bm25Score', () => {
    const buildStats = (docs: string[]) => {
      const tokenized = docs.map(d => tokenize(d));
      const docFreqs = new Map<string, number>();
      let totalLen = 0;
      for (const tokens of tokenized) {
        totalLen += tokens.length;
        for (const t of new Set(tokens)) docFreqs.set(t, (docFreqs.get(t) ?? 0) + 1);
      }
      return { tokenized, docFreqs, avgLen: totalLen / docs.length || 1 };
    };

    it('should rank the document containing query terms higher', () => {
      const texts = [
        'ondas swell período em Ilha Comprida',
        'trânsito na SP-222 e BR-116',
      ];
      const { tokenized, docFreqs, avgLen } = buildStats(texts);

      const q = tokenize('ondas swell');
      const scoreA = bm25Score(q, tokenized[0], docFreqs, 2, avgLen);
      const scoreB = bm25Score(q, tokenized[1], docFreqs, 2, avgLen);
      expect(scoreA).toBeGreaterThan(scoreB);
      expect(scoreB).toBe(0);
    });

    it('should return 0 for empty query or document', () => {
      expect(bm25Score([], ['abc'], new Map(), 1, 1)).toBe(0);
      expect(bm25Score(['abc'], [], new Map(), 1, 1)).toBe(0);
    });
  });

  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
    });

    it('should return 0 for orthogonal vectors', () => {
      expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    });

    it('should return 0 when dimensions mismatch or vectors missing', () => {
      expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
      expect(cosineSimilarity(undefined, [1])).toBe(0);
      expect(cosineSimilarity([1], undefined)).toBe(0);
    });
  });
});
