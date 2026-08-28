import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { parseEnv } from "./common/config/env.schema";
import { HealthController } from "./health.controller";
import { AiSummaryModule } from "./modules/ai-summary/ai-summary.module";
import { CommonModule } from "./modules/common/common.module";
import { ForecastModule } from "./modules/forecast/forecast.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
      validate: parseEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
    CommonModule,
    ForecastModule,
    AiSummaryModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
