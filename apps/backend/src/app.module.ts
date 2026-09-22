import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { parseEnv } from "./common/config/env.schema";
import { FallbackModule } from "./common/fallback/fallback.module";
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

// Throttler 30 req/min — optional, requires `pnpm install` of @nestjs/throttler; fallback no-op if missing
let throttlerImports: unknown[] = [];
let throttlerProviders: unknown[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const throttler = require("@nestjs/throttler");
  throttlerImports = [throttler.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }])];
  throttlerProviders = [{ provide: APP_GUARD, useClass: throttler.ThrottlerGuard }];
} catch {
  throttlerImports = [];
  throttlerProviders = [];
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
      validate: parseEnv,
    }),
    ScheduleModule.forRoot(),
    ...(throttlerImports as never[]),
    FallbackModule,
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
    ...(throttlerProviders as never[]),
  ],
})
export class AppModule {}
