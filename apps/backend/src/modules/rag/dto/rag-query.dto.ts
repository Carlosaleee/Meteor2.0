import { z } from "zod";

export const ragQuerySchema = z.object({
  query: z.string().min(2).max(200),
  topK: z.coerce.number().int().min(1).max(10).default(5),
});

export type RagQueryDto = z.infer<typeof ragQuerySchema>;
