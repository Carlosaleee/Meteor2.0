import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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
    CommonModule,
    ForecastModule,
    AiSummaryModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
