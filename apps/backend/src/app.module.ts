import { Module } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { parseEnv } from "./common/config/env.schema";
import { FallbackModule } from "./common/fallback/fallback.module";
import { AiModule } from "./common/ai/ai.module";
import { EnvelopeInterceptor } from "./common/http/envelope.interceptor";
import { HttpExceptionFilter } from "./common/http/http-exception.filter";
import { HealthController } from "./health.controller";
import { RefreshModule } from "./common/refresh/refresh.module";
import { ComercioModule } from "./modules/comercio/comercio.module";
import { IronModule } from "./modules/iron/iron.module";
import { MeteorologyModule } from "./modules/meteorology/meteorology.module";
import { NewsModule } from "./modules/news/news.module";
import { NoticiasRegionaisModule } from "./modules/noticias-regionais/noticias-regionais.module";
import { OceanographyModule } from "./modules/oceanography/oceanography.module";
import { TrafficModule } from "./modules/traffic/traffic.module";

// Throttler 60 req/min global — @nestjs/throttler é dependência fixa do projeto.
// Loopback (dev local: 127.0.0.1 / ::1) sempre isento para nunca 429 em localhost.
const isLoopback = (context: ExecutionContext): boolean => {
  const req = context.switchToHttp().getRequest<{ ip?: string; socket?: { remoteAddress?: string } }>();
  const ip = req.ip ?? req.socket?.remoteAddress ?? "";
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip.startsWith("127.");
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
      validate: parseEnv,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60, skipIf: isLoopback }]),
    FallbackModule,
    AiModule,
    ComercioModule,
    IronModule,
    MeteorologyModule,
    NewsModule,
    NoticiasRegionaisModule,
    OceanographyModule,
    TrafficModule,
    RefreshModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: EnvelopeInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
