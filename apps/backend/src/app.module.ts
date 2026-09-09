import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { parseEnv } from "./common/config/env.schema";
import { HealthController } from "./health.controller";
import { MeteorologyModule } from "./modules/meteorology/meteorology.module";
import { OceanographyModule } from "./modules/oceanography/oceanography.module";
import { TrafficModule } from "./modules/traffic/traffic.module";

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
    MeteorologyModule,
    OceanographyModule,
    TrafficModule,
  ],
  controllers: [HealthController],
  providers: [...(throttlerProviders as never[])],
})
export class AppModule {}
