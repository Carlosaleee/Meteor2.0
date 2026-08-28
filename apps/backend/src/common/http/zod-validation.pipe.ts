import { BadRequestException, PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: parsed.error.flatten(),
      });
    }
    return parsed.data;
  }
}
