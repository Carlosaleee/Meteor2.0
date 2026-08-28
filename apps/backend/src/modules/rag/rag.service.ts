import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import type { Env } from "../../common/config/env.schema";
import { RagRepository } from "./rag.repository";

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly rag: RagRepository,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async query(query: string, topK = 5): Promise<{ answer: string; sources: unknown[] }> {
    const chunks = await this.rag.query(query, topK);
    const context = chunks.map((c) => `[${c.source}:${c.sourceId ?? ""}] ${c.content}`).join("\n---\n").slice(0, 6000);

    const apiKey = this.config.get("GEMINI_API_KEY", { infer: true });
    const model = this.config.get("GEMINI_MODEL", { infer: true }) as string;
    const temperature = this.config.get("GEMINI_TEMPERATURE", { infer: true }) as number;

    if (!apiKey || apiKey === "SUA_CHAVE_AQUI") {
      return {
        answer: `MRAG (sem GEMINI_API_KEY): ${chunks.length} chunks para "${query}" — ${chunks[0]?.content.slice(0, 200) ?? "sem contexto"}`,
        sources: chunks,
      };
    }

    try {
      const client = new GoogleGenAI({ apiKey });
      const prompt = `Você é o assistente Meteor MRAG. Responda em PT-BR, 2-3 frases, usando só o contexto abaixo. Contexto:\n${context}\n\nPergunta: ${query}`;
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: { temperature, candidateCount: 1 },
      } as never);
      const text = (response as unknown as { text?: string }).text ?? "";
      return { answer: (text || `MRAG: ${chunks.length} fontes`).trim(), sources: chunks };
    } catch (e) {
      this.logger.warn(`RAG query failed: ${String(e)}`);
      return { answer: `MRAG fallback: ${chunks.length} fontes para "${query}"`, sources: chunks };
    }
  }

  async ingestForecast(locationId: string, payload: unknown): Promise<void> {
    await this.rag.addForecastChunks(locationId, payload);
  }

  async ingestNoticias(noticias: Array<{ id: number; title: string; excerpt: string }>): Promise<void> {
    await this.rag.addNoticiaChunks(noticias);
  }
}
