import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import type { Env } from "./common/config/env.schema";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  const config = app.get(ConfigService<Env, true>);
  const origin = config.get("FRONTEND_ORIGIN", { infer: true });

  // Security headers — helmet if installed, fallback manual
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    // @ts-ignore — require available at runtime via @types/node
    const helmet = require("helmet");
    // @ts-ignore — helmet types optional
    app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  } catch {
    app.use((_: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-XSS-Protection", "0");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      next();
    });
  }

  app.enableCors({ origin, credentials: false });
  const port = config.get("PORT", { infer: true });
  await app.listen(port);
}

void bootstrap();
