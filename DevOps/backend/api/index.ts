import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "../../apps/backend/src/app.module";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";

const app = express();

let nestApp: ReturnType<typeof NestFactory.create> extends Promise<infer T> ? T : never;

async function bootstrap() {
  if (!nestApp) {
    nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(app),
      { abortOnError: false }
    );

    const origin = process.env.FRONTEND_ORIGIN || "*";
    nestApp.enableCors({ origin, credentials: false });

    await nestApp.init();
  }
  return nestApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const nestApp = await bootstrap();
  await nestApp.getHttpAdapter().getInstance()(req, res);
}
