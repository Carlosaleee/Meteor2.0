import { Body, Controller, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/http/zod-validation.pipe";
import { aiSummaryBodySchema, type AiSummaryBodyDto } from "./dto/ai-summary-body.dto";
import { AiSummaryService } from "./ai-summary.service";

@Controller("v1/ai-summary")
export class AiSummaryController {
  constructor(private readonly aiSummaryService: AiSummaryService) {}

  @Post()
  create(@Body(new ZodValidationPipe(aiSummaryBodySchema)) body: AiSummaryBodyDto) {
    return this.aiSummaryService.summarize(body);
  }
}
