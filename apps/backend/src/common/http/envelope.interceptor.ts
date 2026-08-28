import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import type { ApiEnvelope } from "./api-envelope";

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiEnvelope<unknown>> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (this.isEnvelope(data)) {
          return data;
        }
        return { success: true, data, error: null };
      }),
    );
  }

  private isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    return "success" in value && "data" in value && "error" in value;
  }
}
