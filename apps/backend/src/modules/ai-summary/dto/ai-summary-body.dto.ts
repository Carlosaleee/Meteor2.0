import { z } from "zod";

export const aiSummaryBodySchema = z.object({
  locationName: z.string().min(1).max(80),
  surfScore: z.number().min(0).max(100),
  windSpeedMs: z.number().nullable(),
  waveHeightM: z.number().nullable(),
  swellHeightM: z.number().nullable(),
  wavePeriodS: z.number().nullable(),
});

export type AiSummaryBodyDto = z.infer<typeof aiSummaryBodySchema>;
