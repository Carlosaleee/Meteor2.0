import { Injectable, Logger } from '@nestjs/common';
import { FallbackService } from '../../../common/fallback/fallback.service';
import { GeminiClientService } from '../../../common/ai/gemini-client.service';
import { chunkText } from './chunker';
import { tokenize, bm25Score, cosineSimilarity } from './scoring';
import { IndexStore } from './index.store';
import type { RagChunk, RagIndex, RagHit } from './rag.types';

const TOP_K = 5;
const EMBEDDING_BATCH_LIMIT = 40;
const EMBEDDING_BATCH_SIZE = 20;
const MAX_CHUNKS_PER_DATA_SOURCE = 12;

// Fallback files que viram "conhecimento base" do Irons.
const DATA_SOURCES = [
  { file: 'fallback-meteorology.json', title: 'meteorology' },
  { file: 'fallback-oceanography.json', title: 'oceanography' },
  { file: 'fallback-weather-news.json', title: 'weather-news' },
  { file: 'fallback-news.json', title: 'news' },
];

/** Achata objeto/arrays em linhas "caminho: valor" — robusto a mudanças de schema. */
function flattenToLines(value: unknown, prefix = '', depth = 0, out: string[] = []): string[] {
  if (depth > 6) return out;
  if (value === null || value === undefined) return out;

  if (Array.isArray(value)) {
    value.slice(0, 30).forEach((item, i) => flattenToLines(item, `${prefix}[${i}]`, depth + 1, out));
    return out;
  }

  if (typeof value === 'object') {
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      flattenToLines(val, prefix ? `${prefix}.${key}` : key, depth + 1, out);
    }
    return out;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    out.push(`${prefix}: ${value}`);
  }
  return out;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  private dataIndex: RagIndex | null = null;

  constructor(
    private readonly store: IndexStore,
    private readonly fallback: FallbackService,
    private readonly gemini: GeminiClientService,
  ) {}

  /**
   * Retrieval híbrido: BM25 (lexical, sempre funciona) + embeddings Gemini
   * (semântico, degrada para BM25 puro quando indisponível).
   */
  async retrieve(query: string, topK = TOP_K): Promise<RagHit[]> {
    const [docs, data] = await Promise.all([
      this.store.loadDocsIndex(),
      this.getDataIndex(),
    ]);

    const chunks: RagChunk[] = [...(docs?.chunks ?? []), ...(data?.chunks ?? [])];
    if (chunks.length === 0) return [];

    const embeddingsById = {
      ...(docs?.embeddings ?? {}),
      ...(data?.embeddings ?? {}),
    };

    // BM25: estatísticas de corpus calculadas uma vez por consulta.
    const tokenizedDocs = chunks.map(c => tokenize(c.text));
    const docFreqs = new Map<string, number>();
    let totalLen = 0;
    for (const tokens of tokenizedDocs) {
      totalLen += tokens.length;
      for (const t of new Set(tokens)) docFreqs.set(t, (docFreqs.get(t) ?? 0) + 1);
    }
    const avgLen = totalLen / chunks.length || 1;
    const queryTokens = tokenize(query);

    // Semântico: embedding da consulta (1 chamada; null => BM25 puro).
    const queryEmbedding = await this.gemini.embed(query).catch(() => null);

    const hits: RagHit[] = chunks.map((chunk, i) => {
      const lexical = bm25Score(queryTokens, tokenizedDocs[i], docFreqs, chunks.length, avgLen);
      // Normalização simples do BM25 para [0,1] permitir mix com o cosseno.
      const lexicalNorm = lexical / (lexical + 1);

      let score = lexicalNorm;
      if (queryEmbedding) {
        const semantic = cosineSimilarity(queryEmbedding, embeddingsById[chunk.id]);
        // Peso maior no semântico quando o embedding do chunk existe; lexical
        // complementa termos exatos (nomes, siglas, localidades).
        score = embeddingsById[chunk.id] ? 0.6 * semantic + 0.4 * lexicalNorm : lexicalNorm;
      }
      return { chunk, score };
    });

    return hits
      .filter(h => h.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private async getDataIndex(): Promise<RagIndex | null> {
    if (this.dataIndex) return this.dataIndex;
    this.dataIndex = await this.store.loadDataIndex();
    return this.dataIndex;
  }

  /**
   * Reindexa o "conhecimento base de dados" da aplicação — chamado pelo
   * RefreshService após cada refresh. Embeddings toleram falha (índice fica
   * lexical e é refeito no próximo refresh).
   */
  async rebuildDataIndex(): Promise<{ chunks: number; embedded: number } | null> {
    const loaded = await Promise.allSettled(
      DATA_SOURCES.map(s => this.fallback.load<unknown>(s.file)),
    );

    const chunks: RagChunk[] = [];
    loaded.forEach((result, i) => {
      if (result.status !== 'fulfilled' || result.value === null) return;
      const source = DATA_SOURCES[i];
      const lines = flattenToLines(result.value, source.title);
      if (lines.length === 0) return;

      chunkText(lines.join('\n'), 800, 120)
        .slice(0, MAX_CHUNKS_PER_DATA_SOURCE)
        .forEach((text, j) => {
          chunks.push({
            id: `data:${source.title}:${j}`,
            title: `Dados: ${source.title}`,
            text,
            source: 'data',
          });
        });
    });

    if (chunks.length === 0) {
      this.logger.warn('RAG data index: nenhum fallback disponível para indexar');
      return null;
    }

    const embeddings: Record<string, number[]> = {};
    let embedded = 0;

    // Lotes via batchEmbedContents (menos chamadas, cron não estoura maxDuration).
    const toEmbed = chunks.slice(0, EMBEDDING_BATCH_LIMIT);
    const batches: RagChunk[][] = [];
    for (let i = 0; i < toEmbed.length; i += EMBEDDING_BATCH_SIZE) {
      batches.push(toEmbed.slice(i, i + EMBEDDING_BATCH_SIZE));
    }
    await Promise.all(
      batches.map(async batch => {
        const vectors = await this.gemini
          .embedBatch(batch.map(c => c.text))
          .catch(() => batch.map(() => null));
        vectors.forEach((vector, i) => {
          if (vector) {
            embeddings[batch[i].id] = vector;
            embedded++;
          }
        });
      }),
    );

    const index: RagIndex = {
      version: 1,
      builtAt: new Date().toISOString(),
      source: 'data',
      chunks,
      ...(embedded > 0 ? { embeddings } : {}),
    };

    await this.store.saveDataIndex(index);
    this.dataIndex = index;
    this.logger.log(`RAG data index reconstruído: ${chunks.length} chunks, ${embedded} embeddings`);
    return { chunks: chunks.length, embedded };
  }
}
