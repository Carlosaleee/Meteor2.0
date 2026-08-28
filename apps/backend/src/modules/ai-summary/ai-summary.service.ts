import { Injectable } from "@nestjs/common";
import type { AiSummaryBodyDto } from "./dto/ai-summary-body.dto";
import { GeminiRepository } from "./gemini.repository";

@Injectable()
export class AiSummaryService {
  constructor(private readonly gemini: GeminiRepository) {}

  async summarize(body: AiSummaryBodyDto): Promise<{ summary: string }> {
    const summary = await this.gemini.generateSurfBrief(body);
    return { summary };
  }
}
