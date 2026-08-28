import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";
import type { ApiEnvelope } from "./api-envelope";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message = "Unexpected error";
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === "string") {
        message = payload;
        code = exception.name;
      } else if (typeof payload === "object" && payload !== null) {
        const body = payload as Record<string, unknown>;
        message = typeof body.message === "string" ? body.message : exception.message;
        code = typeof body.code === "string" ? body.code : exception.name;
        details = body.details ?? body.errors;
        if (Array.isArray(body.message)) {
          message = "Validation failed";
          details = body.message;
          code = "VALIDATION_ERROR";
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = "Unexpected error";
    }

    const body: ApiEnvelope<never> = {
      success: false,
      data: null,
      error: { code, message, details },
    };

    response.status(status).json(body);
  }
}
