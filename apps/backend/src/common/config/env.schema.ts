import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  GEMINI_API_BASE_URL: z.string().url().default("https://generativelanguage.googleapis.com/v1beta/models"),
  STORMGLASS_API_KEY: z.string().optional().default(""),
  INMET_API_TOKEN: z.string().optional().default(""),
  INMET_BASE_URL: z.string().url().default("https://apitempo.inmet.gov.br"),
  GITHUB_TOKEN: z.string().optional().default(""),
  DATABASE_URL: z.string().default("file:./data/meteor.db"),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default("123456"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(raw: NodeJS.ProcessEnv): Env {
  return envSchema.parse(raw);
}
