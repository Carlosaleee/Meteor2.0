import { Global, Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { EnvelopeInterceptor } from "../../common/http/envelope.interceptor";
import { HttpExceptionFilter } from "../../common/http/http-exception.filter";

@Global()
@Module({
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: EnvelopeInterceptor },
  ],
})
export class CommonModule {}
