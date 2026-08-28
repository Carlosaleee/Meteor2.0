import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
  GEMINI_API_KEY: z.string().optional().default(""),
  STORMGLASS_API_KEY: z.string().optional().default(""),
  INMET_API_TOKEN: z.string().optional().default(""),
  INMET_BASE_URL: z.string().url().default("https://apitempo.inmet.gov.br"),
  GITHUB_TOKEN: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(raw: NodeJS.ProcessEnv): Env {
  return envSchema.parse(raw);
}
