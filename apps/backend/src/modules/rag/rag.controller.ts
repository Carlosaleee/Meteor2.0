import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/http/zod-validation.pipe";
import { ragQuerySchema, type RagQueryDto } from "./dto/rag-query.dto";
import { RagService } from "./rag.service";

@Controller("v1/rag")
export class RagController {
  constructor(private readonly rag: RagService) {}

  @Post("query")
  @UsePipes(new ZodValidationPipe(ragQuerySchema))
  async query(@Body() dto: RagQueryDto): Promise<{ answer: string; sources: unknown[] }> {
    return this.rag.query(dto.query, dto.topK);
  }
}
