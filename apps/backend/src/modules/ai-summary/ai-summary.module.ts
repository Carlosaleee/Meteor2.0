import { Module } from "@nestjs/common";
import { AiSummaryController } from "./ai-summary.controller";
import { AiSummaryService } from "./ai-summary.service";
import { GeminiRepository } from "./gemini.repository";

@Module({
  controllers: [AiSummaryController],
  providers: [AiSummaryService, GeminiRepository],
})
export class AiSummaryModule {}
