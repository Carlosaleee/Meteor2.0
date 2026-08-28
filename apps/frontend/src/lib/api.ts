import { z } from "zod";
import {
  envelopeSchema,
  forecastSchema,
  locationSchema,
  type Forecast,
  type Location,
} from "./schemas";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const locationsEnvelope = envelopeSchema(locationSchema.array());
const forecastEnvelope = envelopeSchema(forecastSchema);
const summaryEnvelope = envelopeSchema(z.object({ summary: z.string() }));

const errorEnvelopeSchema = z.object({
  success: z.literal(false),
  data: z.null(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

function unwrapEnvelope<T>(json: unknown, successSchema: z.ZodType<{ success: true; data: T; error: null }>): T {
  const ok = successSchema.safeParse(json);
  if (ok.success) return ok.data.data;
  const err = errorEnvelopeSchema.safeParse(json);
  if (err.success) throw new Error(err.data.error.message || err.data.error.code);
  throw new Error("Invalid payload");
}

export async function fetchLocations(): Promise<Location[]> {
  const response = await fetch(`${baseUrl}/v1/locations`, { signal: AbortSignal.timeout(5000) });
  const json = await response.json();
  if (!response.ok) {
    const err = errorEnvelopeSchema.safeParse(json);
    throw new Error(err.success ? err.data.error.message : `HTTP ${response.status}`);
  }
  return unwrapEnvelope(json, locationsEnvelope);
}

export async function fetchForecast(locationId: string): Promise<Forecast> {
  const url = new URL(`${baseUrl}/v1/forecast`);
  url.searchParams.set("locationId", locationId);
  url.searchParams.set("days", "3");
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  const json = await response.json();
  if (!response.ok) {
    const err = errorEnvelopeSchema.safeParse(json);
    throw new Error(err.success ? err.data.error.message : `HTTP ${response.status}`);
  }
  return unwrapEnvelope(json, forecastEnvelope);
}

export async function fetchAiSummary(forecast: Forecast): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/ai-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locationName: forecast.location.name,
      surfScore: forecast.surfScore,
      windSpeedMs: forecast.atmosphere?.windSpeedMs ?? null,
      waveHeightM: forecast.marine?.waveHeightM ?? null,
      swellHeightM: forecast.marine?.swellHeightM ?? null,
      wavePeriodS: forecast.marine?.wavePeriodS ?? null,
    }),
    signal: AbortSignal.timeout(5000),
  });
  const json = await response.json();
  if (!response.ok) {
    return "";
  }
  const parsed = summaryEnvelope.safeParse(json);
  if (!parsed.success) {
    const err = errorEnvelopeSchema.safeParse(json);
    return err.success ? "" : "";
  }
  return parsed.data.data.summary;
}
