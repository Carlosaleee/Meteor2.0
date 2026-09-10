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

export function parseEnv(raw: NodeJS.ProcessEnv): Env {
  return envSchema.parse(raw);
}
