import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import type { Env } from "../../../common/config/env.schema";
import type { AiSummaryBodyDto } from "../dto/ai-summary-body.dto";

@Injectable()
export class GeminiRepository {
  private readonly logger = new Logger(GeminiRepository.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  async generateSurfBrief(input: AiSummaryBodyDto): Promise<string> {
    const apiKey = this.config.get("GEMINI_API_KEY", { infer: true });
    if (!apiKey) {
      return this.fallback(input);
    }

    try {
      const client = new GoogleGenAI({ apiKey });
      const prompt = [
        "Resumo tático de surf em 2 frases, PT-BR, sem emoji.",
        `Local: ${input.locationName}. Score: ${input.surfScore}.`,
        `Vento m/s: ${input.windSpeedMs ?? "n/d"}. Onda m: ${input.waveHeightM ?? "n/d"}.`,
        `Swell m: ${input.swellHeightM ?? "n/d"}. Período s: ${input.wavePeriodS ?? "n/d"}.`,
      ].join(" ");

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        return this.fallback(input);
      }
      return text.trim();
    } catch (error) {
      this.logger.warn(`Gemini failed: ${String(error)}`);
      return this.fallback(input);
    }
  }

  private fallback(input: AiSummaryBodyDto): string {
    return `${input.locationName}: score ${input.surfScore}. Swell ${input.swellHeightM ?? "n/d"} m, vento ${input.windSpeedMs ?? "n/d"} m/s.`;
  }
}
