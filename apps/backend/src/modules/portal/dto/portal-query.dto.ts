import { z } from "zod";

export const portalQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(6),
  source: z.enum(["g1", "climmatempo", "all"]).default("all"),
});

export type PortalQueryDto = z.infer<typeof portalQuerySchema>;
