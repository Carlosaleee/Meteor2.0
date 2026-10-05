import type { VercelRequest, VercelResponse } from "@vercel/node";
import { existsSync, readdirSync } from "fs";

function safeList(dir: string, max = 25): string {
  try {
    return readdirSync(dir).slice(0, max).join(",");
  } catch (e) {
    return `ERR(${(e as Error).message.slice(0, 60)})`;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const parts: string[] = [
    `FALLBACK_DIR=${process.env.FALLBACK_DIR || "(unset)"}`,
    `cwd=${process.cwd()}`,
    `exists/var/task/data=${existsSync("/var/task/data")}`,
    `exists/apps/backend/data=${existsSync("/var/task/apps/backend/data")}`,
    `ls/var/task=${safeList("/var/task", 15)}`,
    `ls/var/task/data=${safeList("/var/task/data", 10)}`,
    `ls/var/task/apps/backend/data=${safeList("/var/task/apps/backend/data", 10)}`,
    `ls/var/task/apps/backend=${safeList("/var/task/apps/backend", 20)}`,
  ];
  res.statusCode = 200;
  res.end(parts.join(" | "));
}
