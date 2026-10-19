import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema';

export type GeminiChatTurn = {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
};

export type GenerateTextOptions = {
  /** Prompt simples (usado quando `contents` não é informado). */
  prompt?: string;
  /** Turns estruturados da conversa (alternativa ao `prompt` simples). */
  contents?: GeminiChatTurn[];
  /** Instrução de sistema — persona/regras fixas (não vai no turno do usuário). */
  systemInstruction?: string;
  maxOutputTokens?: number;
  temperature?: number;
};

/**
 * Cliente Gemini compartilhado (resumo tático, chat Iron e embeddings do RAG).
 * Init lazy via require() — o SDK @google/genai é ESM-only.
 */
@Injectable()
export class GeminiClientService {
  private readonly logger = new Logger(GeminiClientService.name);
  private client: unknown = null;

  constructor(private readonly config: ConfigService<Env>) {}

  get isConfigured(): boolean {
    return Boolean(this.config.get('GEMINI_API_KEY'));
  }

  private getClient(): unknown {
    if (this.client) return this.client;

    const apiKey = this.config.get('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured');
      return null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GoogleGenAI } = require('@google/genai');
      this.client = new GoogleGenAI({ apiKey });
      return this.client;
    } catch (err) {
      this.logger.warn(`Failed to initialize Gemini client: ${err}`);
      return null;
    }
  }

  /** Gera texto; retorna null quando o cliente não existe, falha ou volta vazio. */
  async generateText(options: GenerateTextOptions): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;

    const contents = options.contents ?? options.prompt;
    if (!contents) return null;

    try {
      const response = await (client as {
        models: {
          generateContent: (opts: unknown) => Promise<unknown>;
        };
      }).models.generateContent({
        model: this.config.get('GEMINI_MODEL') ?? 'gemini-2.5-flash',
        contents,
        config: {
          temperature: options.temperature ?? this.config.get('GEMINI_TEMPERATURE') ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 1500,
          ...(options.systemInstruction
            ? { systemInstruction: options.systemInstruction }
            : {}),
        },
      });

      const text = (response as { text?: string })?.text?.trim();
      return text ? text : null;
    } catch (err) {
      this.logger.warn(`Gemini generateContent failed: ${err}`);
      return null;
    }
  }

  /**
   * Embedding vetorial (RAG); retorna null se indisponível.
   *
   * Implementado via REST direto (não o SDK): a API Gemini trocou o schema de
   * `contents[]` para `content` (singular) no embedContent — o SDK pode ainda
   * não acompanhar. O generateContent continua via SDK (schema `contents[]`
   * segue válido).
   */
  async embed(text: string): Promise<number[] | null> {
    const model = this.config.get('GEMINI_EMBEDDING_MODEL') ?? 'gemini-embedding-2';
    const dims = this.config.get('GEMINI_EMBEDDING_DIMS') ?? 128;
    const data = await this.restCall(`${model}:embedContent`, {
      model: `models/${model}`,
      content: { parts: [{ text }] },
      outputDimensionality: dims,
    });
    const values = (data as { embedding?: { values?: number[] } } | null)?.embedding?.values;
    return values && values.length > 0 ? values : null;
  }

  /** Embedding em lote (até ~100 por chamada); null quando a chamada inteira falha. */
  async embedBatch(texts: string[]): Promise<(number[] | null)[]> {
    if (texts.length === 0) return [];
    const model = this.config.get('GEMINI_EMBEDDING_MODEL') ?? 'gemini-embedding-2';
    const dims = this.config.get('GEMINI_EMBEDDING_DIMS') ?? 128;
    const data = await this.restCall(`${model}:batchEmbedContents`, {
      requests: texts.map(text => ({
        model: `models/${model}`,
        content: { parts: [{ text }] },
        outputDimensionality: dims,
      })),
    });

    const embeddings = (data as { embeddings?: Array<{ values?: number[] }> } | null)?.embeddings;
    if (!embeddings) return texts.map(() => null);
    return texts.map((_, i) => {
      const values = embeddings[i]?.values;
      return values && values.length > 0 ? values : null;
    });
  }

  private async restCall(endpoint: string, body: unknown): Promise<unknown | null> {
    const apiKey = this.config.get('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured');
      return null;
    }

    const base = this.config.get('GEMINI_API_BASE_URL')
      ?? 'https://generativelanguage.googleapis.com/v1beta/models';

    try {
      const res = await fetch(`${base}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        this.logger.warn(`Gemini REST ${endpoint} -> ${res.status}: ${errText.slice(0, 200)}`);
        return null;
      }
      return (await res.json()) as unknown;
    } catch (err) {
      this.logger.warn(`Gemini REST ${endpoint} failed: ${err}`);
      return null;
    }
  }
}
