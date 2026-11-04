import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import type { Env } from "./common/config/env.schema";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  // Backlog P2 #1: atrás da Vercel há 1 proxy — 'trust proxy' 1 faz o Express
  // confiar no primeiro X-Forwarded-For, senão todo cliente rate-limited
  // compartilha o IP do proxy (risco real de 429 em massa em produção).
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  const config = app.get(ConfigService<Env, true>);
  const origin = config.get("FRONTEND_ORIGIN", { infer: true });

  // Security headers — helmet if installed, fallback manual
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const helmet = require("helmet");
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

  app.enableCors({ origin, credentials: true });
  const port = config.get("PORT", { infer: true });
  await app.listen(port);
}

void bootstrap();
