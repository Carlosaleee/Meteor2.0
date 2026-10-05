import type { VercelRequest, VercelResponse } from "@vercel/node";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

const nativeImport = new Function("s", "return import(s)") as (s: string) => Promise<Record<string, unknown>>;

function safeList(dir: string, max = 12): string {
  try {
    return readdirSync(dir).slice(0, max).join(",");
  } catch (e) {
    return `ERR(${(e as Error).message.slice(0, 80)})`;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const parts: string[] = [
    `node=${process.version}`,
    `cwd=${process.cwd()}`,
    `ls/var/task=${safeList("/var/task", 20)}`,
    `ls/backend=${safeList("/var/task/apps/backend", 25)}`,
    `ls/backend/src=${safeList("/var/task/apps/backend/src", 15)}`,
    `ls/backend/node_modules=${safeList("/var/task/apps/backend/node_modules", 15)}`,
    `exists/app.module.js=${existsSync("/var/task/apps/backend/src/app.module.js")}`,
    `exists/dist=${existsSync("/var/task/apps/backend/dist/main.js")}`,
  ];

  let resolved = "";
  try {
    resolved = require.resolve("@nestjs/core");
    parts.push(`resolve/core=${resolved}`);
  } catch (e) {
    parts.push(`resolve/core=FAIL(${(e as Error).message.slice(0, 100)})`);
    res.statusCode = 500;
    res.end(parts.join(" | "));
    return;
  }

  try {
    await nativeImport(pathToFileURL(resolved).href);
    parts.push("fileUrlImport=OK");
  } catch (e) {
    parts.push(`fileUrlImport=FAIL(${(e as Error & { code?: string }).code}: ${(e as Error).message.slice(0, 150)})`);
  }

  try {
    await nativeImport("@nestjs/core");
    parts.push("bareImport=OK");
  } catch (e) {
    parts.push(`bareImport=FAIL(${(e as Error & { code?: string }).code})`);
  }

  const appModUrl = pathToFileURL("/var/task/apps/backend/src/app.module.js").href;
  try {
    await nativeImport(appModUrl);
    parts.push("appModuleImport=OK");
  } catch (e) {
    parts.push(`appModuleImport=FAIL(${(e as Error & { code?: string }).code}: ${(e as Error).message.slice(0, 180)})`);
  }

  res.statusCode = parts.some((p) => p.includes("FAIL")) ? 500 : 200;
  res.end(parts.join(" | "));
}
