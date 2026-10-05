import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";

const app = express();

type NestApp = Awaited<ReturnType<typeof NestFactory.create>>;
let nestApp: NestApp | null = null;

async function bootstrap(): Promise<NestApp> {
  if (!nestApp) {
    const instance = await NestFactory.create(AppModule, new ExpressAdapter(app), {
      abortOnError: false,
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const helmet = require("helmet");
      instance.use(
        helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }),
      );
    } catch {
      // helmet ausente — segue sem headers extras
    }

    const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
    instance.enableCors({ origin, credentials: true });

    await instance.init();
    nestApp = instance;
  }
  return nestApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const app = await bootstrap();
  const instance = app.getHttpAdapter().getInstance() as (
    req: VercelRequest,
    res: VercelResponse,
  ) => void | Promise<void>;
  await instance(req, res);
}
