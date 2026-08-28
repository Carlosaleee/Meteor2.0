import { z } from "zod";

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  region: z.enum(["ilha-comprida", "vale-do-ribeira"]),
  lat: z.number(),
  lon: z.number(),
  inmetStationId: z.string(),
});

export const forecastSchema = z.object({
  location: locationSchema,
  surfScore: z.number(),
  atmosphere: z
    .object({
      temperatureC: z.number().nullable(),
      windSpeedMs: z.number().nullable(),
      windDirectionDeg: z.number().nullable(),
      precipitationMm: z.number().nullable(),
      hourly: z.array(
        z.object({
          time: z.string(),
          windSpeedMs: z.number(),
          temperatureC: z.number(),
        }),
      ),
    })
    .nullable(),
  marine: z
    .object({
      waveHeightM: z.number().nullable(),
      wavePeriodS: z.number().nullable(),
      waveDirectionDeg: z.number().nullable(),
      swellHeightM: z.number().nullable(),
      hourly: z.array(z.object({ time: z.string(), waveHeightM: z.number() })),
    })
    .nullable(),
  sources: z.array(
    z.object({
      id: z.string(),
      status: z.enum(["ok", "error", "disabled"]),
      data: z.unknown().nullable(),
      message: z.string().optional(),
    }),
  ),
});

export const envelopeSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    error: z.null(),
  });

export type Location = z.infer<typeof locationSchema>;
export type Forecast = z.infer<typeof forecastSchema>;
