import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import { AppModule } from "../src/app.module";

const app = express();
let nestApp: any;

async function bootstrap() {
  if (!nestApp) {
    nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app), {
      abortOnError: false,
    });

    const origin = process.env.FRONTEND_ORIGIN || "*";
    nestApp.enableCors({ origin, credentials: false });

    await nestApp.init();
  }
  return nestApp;
}

export default async function handler(req: any, res: any) {
  const nestApp = await bootstrap();
  await nestApp.getHttpAdapter().getInstance()(req, res);
}
