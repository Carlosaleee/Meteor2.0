import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FallbackService } from '../../../common/fallback/fallback.service';
import { singleFlight } from '../../../common/async/single-flight';
import type { RagIndex } from './rag.types';

const DOCS_INDEX_FILE = 'rag-index-docs.json';
const DATA_INDEX_FILE = 'rag-index-data.json';

/**
 * Persistência dos índices RAG:
 * - docs: versionado em `apps/backend/data/rag-index-docs.json` (dentro do bundle
 *   da Vercel via includeFiles); somente leitura em produção.
 * - data: gerado em runtime pelo RefreshService; escrito via FallbackService
 *   (em produção, /tmp).
 */
@Injectable()
export class IndexStore {
  private readonly logger = new Logger(IndexStore.name);
  private docsIndex: RagIndex | null = null;

  constructor(private readonly fallback: FallbackService) {}

  async loadDocsIndex(): Promise<RagIndex | null> {
    if (this.docsIndex) return this.docsIndex;

    return singleFlight('rag:load-docs', async () => {
      const dir = path.resolve(process.cwd(), 'data');
      try {
        const raw = await fs.readFile(path.join(dir, DOCS_INDEX_FILE), 'utf-8');
        const parsed = JSON.parse(raw) as RagIndex;
        if (!Array.isArray(parsed.chunks) || parsed.chunks.length === 0) {
          this.logger.warn('rag-index-docs.json vazio ou inválido — retrieval usa só dados');
          return null;
        }
        this.docsIndex = parsed;
        this.logger.log(`Índice RAG docs carregado: ${parsed.chunks.length} chunks (builtAt=${parsed.builtAt})`);
        return parsed;
      } catch (err) {
        this.logger.warn(`Índice RAG docs indisponível (${DOCS_INDEX_FILE}): ${err}`);
        return null;
      }
    });
  }

  async loadDataIndex(): Promise<RagIndex | null> {
    return this.fallback.load<RagIndex>(DATA_INDEX_FILE);
  }

  async saveDataIndex(index: RagIndex): Promise<void> {
    await this.fallback.save(DATA_INDEX_FILE, index);
  }
}
