import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const parts: string[] = [`node=${process.version}`, `vercel=${process.env.VERCEL || "-"}`];

  try {
    await import("@nestjs/core");
    parts.push("dynamicImport@nestjs/core=OK");
  } catch (e) {
    const err = e as Error & { code?: string };
    parts.push(`dynamicImport@nestjs/core=FAIL(${err.code || err.name}: ${err.message.slice(0, 200)})`);
  }

  try {
    const { NestFactory } = await import("@nestjs/core");
    const { ExpressAdapter } = await import("@nestjs/platform-express");
    const { AppModule } = await import("../src/app.module");
    const express = (await import("express")).default;

    const app = express();
    const instance = await NestFactory.create(AppModule, new ExpressAdapter(app), {
      abortOnError: false,
    });
    const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
    instance.enableCors({ origin, credentials: true });
    await instance.init();
    parts.push("bootstrap=OK");
    res.statusCode = 200;
    res.end(parts.join(" | "));
    return;
  } catch (e) {
    const err = e as Error & { code?: string };
    parts.push(`bootstrap=FAIL(${err.code || err.name}: ${err.message.slice(0, 300)})`);
    res.statusCode = 500;
    res.end(parts.join(" | "));
  }
}
