import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import type { Env } from "./common/config/env.schema";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  const config = app.get(ConfigService<Env, true>);
  const origin = config.get("FRONTEND_ORIGIN", { infer: true });
  app.enableCors({ origin, credentials: false });
  const port = config.get("PORT", { infer: true });
  await app.listen(port);
}

void bootstrap();
