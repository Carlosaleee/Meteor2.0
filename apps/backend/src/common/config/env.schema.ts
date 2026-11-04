import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  // Accepts single URL or comma-separated list of URLs for multi-origin CORS support.
  // Every entry must be a valid URL — "not-a-url" or "a.com,,b.com" are rejected.
  FRONTEND_ORIGIN: z
    .string()
    .min(1)
    .superRefine((value, ctx) => {
      const origins = value.split(",").map((o) => o.trim());
      const invalid =
        origins.some((o) => o === "") ||
        !origins.every((o) => z.string().url().safeParse(o).success);
      if (invalid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "FRONTEND_ORIGIN deve ser uma URL ou lista separada por virgulas de URLs",
        });
      }
    })
    .default("http://localhost:3000"),
  FALLBACK_DIR: z.string().default("data"),
  FALLBACK_MAX_AGE_HOURS: z.coerce.number().int().positive().default(24),
  /** Modelo Open-Meteo pedido na query (MET-04): padrao best_match do provedor; ex.: icon_dwd, ecmwf_ifs04. */
  OPEN_METEO_MODELS: z.string().min(1).default("best_match"),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-flash-latest"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-2"),
  /** Dimensão dos vetores do RAG — menor = índice menor; 128 basta p/ ~200 chunks. */
  GEMINI_EMBEDDING_DIMS: z.coerce.number().int().positive().max(3072).default(128),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  GEMINI_API_BASE_URL: z.string().url().default("https://generativelanguage.googleapis.com/v1beta/models"),
  STORMGLASS_API_KEY: z.string().optional().default(""),
  INMET_API_TOKEN: z.string().optional().default(""),
  INMET_BASE_URL: z.string().url().default("https://apitempo.inmet.gov.br"),
  GITHUB_TOKEN: z.string().optional().default(""),
  /** API oficial CCM/ARTESP de ocorrencias rodoviarias (opcional; sem chave usa o painel Waze publico). */
  ARTESP_API_KEY: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Resultado do `validate` do @nestjs/config: schema validado + as chaves originais do
 * env que o Zod descarta (CRON_SECRET etc.), para que sejam publicadas em process.env.
 */
type ValidatedEnv = Env & { [key: string]: unknown };

export function parseEnv(raw: NodeJS.ProcessEnv): ValidatedEnv {
  // O `validate` do @nestjs/config publica SOMENTE o objeto retornado em process.env.
  // O Zod (strip por padrao) descarta chaves fora do schema — ex.: CRON_SECRET, que o
  // CronController le via `process.env` cru. Mesclamos o env original de volta.
  return { ...raw, ...envSchema.parse(raw) };
}
