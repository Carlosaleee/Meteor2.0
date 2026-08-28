import { Injectable, Logger } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type RagChunk = {
  id: string;
  source: string;
  sourceId?: string;
  content: string;
};

@Injectable()
export class RagRepository {
  private readonly logger = new Logger(RagRepository.name);
  private chunks: RagChunk[] = [];
  private initialized = false;

  async ensureIngested(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    try {
      // Ingest docs + README
      const docs = [
        { path: "README.md", source: "readme" },
        { path: "docs/api.md", source: "docs" },
        { path: "DESIGN.md", source: "docs" },
      ];
      for (const { path, source } of docs) {
        try {
          const full = join(process.cwd(), "..", "..", path);
          const alt = join(process.cwd(), path);
          let content = "";
          try {
            content = await readFile(full, "utf-8");
          } catch {
            content = await readFile(alt, "utf-8");
          }
          if (content) {
            this.chunks.push({
              id: `${source}:${path}`,
              source,
              sourceId: path,
              content: content.slice(0, 2000),
            });
          }
        } catch (e) {
          this.logger.warn(`RAG ingest docs failed ${path}: ${String(e)}`);
        }
      }
      this.logger.log(`RAG ingested ${this.chunks.length} docs chunks`);
    } catch (e) {
      this.logger.warn(`RAG ensureIngested failed: ${String(e)}`);
    }
  }

  async addForecastChunks(locationId: string, payload: unknown): Promise<void> {
    const content = JSON.stringify(payload).slice(0, 1500);
    this.chunks.push({ id: `forecast:${locationId}:${Date.now()}`, source: "forecast", sourceId: locationId, content });
    if (this.chunks.length > 100) this.chunks = this.chunks.slice(-100);
  }

  async addNoticiaChunks(noticias: Array<{ id: number; title: string; excerpt: string }>): Promise<void> {
    for (const n of noticias) {
      this.chunks.push({ id: `noticias:${n.id}`, source: "noticias", sourceId: String(n.id), content: `${n.title} — ${n.excerpt}`.slice(0, 800) });
    }
  }

  async addInmetChunk(stationId: string, data: unknown): Promise<void> {
    this.chunks.push({ id: `inmet:${stationId}:${Date.now()}`, source: "inmet", sourceId: stationId, content: JSON.stringify(data).slice(0, 800) });
  }

  // MRAG: multi-retrieval via keyword + source filter
  async query(query: string, topK = 5): Promise<RagChunk[]> {
    await this.ensureIngested();
    const q = query.toLowerCase();
    const scored = this.chunks
      .map((c) => {
        const contentLower = c.content.toLowerCase();
        let score = 0;
        for (const term of q.split(/\s+/)) {
          if (contentLower.includes(term)) score += 1;
        }
        // Boost forecast/noticias/inmet for surf queries
        if (q.includes("onda") || q.includes("surf") || q.includes("vento")) {
          if (c.source === "forecast" || c.source === "inmet") score += 0.5;
        }
        if (q.includes("noticia") || q.includes("vale")) {
          if (c.source === "noticias") score += 0.5;
        }
        return { c, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ c }) => c);

    if (scored.length === 0) return this.chunks.slice(0, Math.min(topK, 3));
    return scored;
  }

  async all(): Promise<RagChunk[]> {
    await this.ensureIngested();
    return this.chunks;
  }
}
