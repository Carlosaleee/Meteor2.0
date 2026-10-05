import type { VercelRequest, VercelResponse } from "@vercel/node";
import { join } from "path";
import { pathToFileURL } from "url";

const nativeImport = new Function("s", "return import(s)") as (s: string) => Promise<Record<string, unknown>>;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const parts: string[] = [
    `node=${process.version}`,
    `cwd=${process.cwd()}`,
    `execArgv=${JSON.stringify(process.execArgv)}`,
    `NODE_OPTIONS=${process.env.NODE_OPTIONS || "(unset)"}`,
  ];

  try {
    await nativeImport("@nestjs/core");
    parts.push("bareImport=OK");
  } catch (e) {
    const err = e as Error & { code?: string };
    parts.push(`bareImport=FAIL(${err.code}: ${err.message.slice(0, 120)})`);
    res.statusCode = 500;
    res.end(parts.join(" | "));
    return;
  }

  try {
    await nativeImport(pathToFileURL(join(__dirname, "../src/app.module.js")).href);
    parts.push("appModuleImport=OK");
  } catch (e) {
    const err = e as Error & { code?: string };
    parts.push(`appModuleImport=FAIL(${err.code}: ${err.message.slice(0, 200)})`);
  }

  try {
    const { NestFactory } = (await nativeImport("@nestjs/core")) as never;
    const { ExpressAdapter } = (await nativeImport("@nestjs/platform-express")) as never;
    const { AppModule } = (await nativeImport(pathToFileURL(join(__dirname, "../src/app.module.js")).href)) as never;
    const express = ((await nativeImport("express")) as { default: never }).default;

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
  } catch (e) {
    const err = e as Error & { code?: string };
    parts.push(`bootstrap=FAIL(${err.code}: ${err.message.slice(0, 250)})`);
    res.statusCode = 500;
    res.end(parts.join(" | "));
  }
}
