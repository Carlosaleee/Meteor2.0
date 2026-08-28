import { z } from "zod";

export const forecastQuerySchema = z.object({
  locationId: z.string().min(1).default("ilha-comprida"),
  days: z.coerce.number().int().min(1).max(7).default(3),
});

export type ForecastQueryDto = z.infer<typeof forecastQuerySchema>;
