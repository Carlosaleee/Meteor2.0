import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { parseEnv } from "./common/config/env.schema";
import { HealthController } from "./health.controller";
import { AiSummaryModule } from "./modules/ai-summary/ai-summary.module";
import { CommonModule } from "./modules/common/common.module";
import { ForecastModule } from "./modules/forecast/forecast.module";
import { PortalModule } from "./modules/portal/portal.module";
import { RagModule } from "./modules/rag/rag.module";

// Throttler 30 req/min — optional, requires `pnpm install` of @nestjs/throttler; fallback no-op if missing
let throttlerImports: unknown[] = [];
let throttlerProviders: unknown[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const throttler = require("@nestjs/throttler");
  const throttlerCore = require("@nestjs/core");
  throttlerImports = [throttler.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }])];
  throttlerProviders = [{ provide: throttlerCore.APP_GUARD, useClass: throttler.ThrottlerGuard }];
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
    ...(throttlerImports as never[]),
    CommonModule,
    ForecastModule,
    AiSummaryModule,
    PortalModule,
    RagModule,
  ],
  controllers: [HealthController],
  providers: [...(throttlerProviders as never[])],
})
export class AppModule {}
