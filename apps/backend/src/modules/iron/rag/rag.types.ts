export type RagChunk = {
  id: string;
  /** Título do documento ou domínio (ex.: 'SYSTEM_SPEC.md', 'meteorology'). */
  title: string;
  /** Seção dentro do documento (quando aplicável). */
  section?: string;
  text: string;
  source: 'docs' | 'data';
  url?: string;
};

export type RagIndex = {
  version: number;
  builtAt: string;
  source: 'docs' | 'data';
  chunks: RagChunk[];
  /** Embeddings por chunkId — ausente quando a indexação foi só lexical (BM25). */
  embeddings?: Record<string, number[]>;
};

export type RagHit = {
  chunk: RagChunk;
  score: number;
};
