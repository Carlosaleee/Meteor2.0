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

export async function fetchLocations(): Promise<Location[]> {
  const response = await fetch(`${baseUrl}/v1/locations`);
  const parsed = locationsEnvelope.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Invalid locations payload");
  }
  return parsed.data.data;
}

export async function fetchForecast(locationId: string): Promise<Forecast> {
  const url = new URL(`${baseUrl}/v1/forecast`);
  url.searchParams.set("locationId", locationId);
  url.searchParams.set("days", "3");
  const response = await fetch(url);
  const parsed = forecastEnvelope.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Invalid forecast payload");
  }
  return parsed.data.data;
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
  });
  const parsed = summaryEnvelope.safeParse(await response.json());
  if (!parsed.success) {
    return "";
  }
  return parsed.data.data.summary;
}
