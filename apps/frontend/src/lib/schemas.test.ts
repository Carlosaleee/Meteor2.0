import { describe, expect, it } from "vitest";
import { forecastSchema } from "./schemas";

describe("forecastSchema", () => {
  it("accepts a valid HUD payload", () => {
    const parsed = forecastSchema.safeParse({
      location: {
        id: "ilha-comprida",
        name: "Ilha Comprida",
        region: "ilha-comprida",
        lat: -24.7,
        lon: -47.5,
        inmetStationId: "A712",
      },
      surfScore: 70,
      atmosphere: {
        temperatureC: 24,
        windSpeedMs: 3,
        windDirectionDeg: 180,
        precipitationMm: 0,
        hourly: [],
      },
      marine: {
        waveHeightM: 1,
        wavePeriodS: 9,
        waveDirectionDeg: 140,
        swellHeightM: 0.9,
        hourly: [],
      },
      sources: [{ id: "open-meteo", status: "ok", data: null }],
    });
    expect(parsed.success).toBe(true);
  });
});
