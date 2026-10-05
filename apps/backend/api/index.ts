import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import helmet from "helmet";

const app = express();

type NestApp = Awaited<ReturnType<typeof NestFactory.create>>;
let nestApp: NestApp | null = null;

async function bootstrap(): Promise<NestApp> {
  if (!nestApp) {
    const instance = await NestFactory.create(AppModule, new ExpressAdapter(app), {
      abortOnError: false,
    });

    instance.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

    const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
    instance.enableCors({ origin, credentials: true });

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
