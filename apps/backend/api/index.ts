import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import helmet from "helmet";

const app = express();
// Backlog P2 #1: 1 hop de proxy na Vercel — permite throttler por IP real do cliente.
app.set('trust proxy', 1);

type NestApp = Awaited<ReturnType<typeof NestFactory.create>>;
let nestApp: NestApp | null = null;

async function bootstrap(): Promise<NestApp> {
  if (!nestApp) {
    const instance = await NestFactory.create(AppModule, new ExpressAdapter(app), {
      abortOnError: false,
    });

    instance.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

    // Support comma-separated list of allowed origins + Vercel preview deployments
    const rawOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
    const allowedOrigins = rawOrigin.split(",").map((o) => o.trim()).filter(Boolean);
    const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true); // allow non-browser requests (cron, health)
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/[\w-]+-[\w-]+\.vercel\.app$/.test(origin) || // Vercel preview URLs
        origin === "http://localhost:3000" ||
        origin === "http://localhost:3001";
      callback(isAllowed ? null : new Error(`CORS: origin not allowed — ${origin}`), isAllowed);
    };
    instance.enableCors({ origin: corsOrigin, credentials: true });

    await instance.init();
    nestApp = instance;
  }
  return nestApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const application = await bootstrap();
    const instance = application.getHttpAdapter().getInstance() as (
      req: VercelRequest,
      res: VercelResponse,
    ) => void | Promise<void>;
    await instance(req, res);
  } catch (err) {
    console.error("serverless handler error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Internal Server Error");
    }
  }
}
