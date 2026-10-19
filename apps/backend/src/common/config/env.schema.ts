import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
  FALLBACK_DIR: z.string().default("data"),
  FALLBACK_MAX_AGE_HOURS: z.coerce.number().int().positive().default(24),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  GEMINI_API_BASE_URL: z.string().url().default("https://generativelanguage.googleapis.com/v1beta/models"),
  STORMGLASS_API_KEY: z.string().optional().default(""),
  INMET_API_TOKEN: z.string().optional().default(""),
  INMET_BASE_URL: z.string().url().default("https://apitempo.inmet.gov.br"),
  GITHUB_TOKEN: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Resultado do `validate` do @nestjs/config: schema validado + as chaves originais do
 * env que o Zod descarta (CRON_SECRET etc.), para que sejam publicadas em process.env.
 */
export type ValidatedEnv = Env & { [key: string]: unknown };

export function parseEnv(raw: NodeJS.ProcessEnv): ValidatedEnv {
  // O `validate` do @nestjs/config publica SOMENTE o objeto retornado em process.env.
  // O Zod (strip por padrao) descarta chaves fora do schema — ex.: CRON_SECRET, que o
  // CronController le via `process.env` cru. Mesclamos o env original de volta.
  return { ...raw, ...envSchema.parse(raw) };
}
