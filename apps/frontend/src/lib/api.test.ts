import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fetchForecast, fetchLocations } from "./api";

const okLocations = {
  success: true,
  data: [{ id: "ilha-comprida", name: "Ilha Comprida", region: "ilha-comprida", lat: -24.7, lon: -47.5, inmetStationId: "A712" }],
  error: null,
};
const okForecast = {
  success: true,
  data: {
    location: { id: "ilha-comprida", name: "Ilha Comprida", region: "ilha-comprida", lat: -24.7, lon: -47.5, inmetStationId: "A712" },
    surfScore: 70,
    atmosphere: { temperatureC: 24, windSpeedMs: 3, windDirectionDeg: 180, precipitationMm: 0, hourly: [] },
    marine: { waveHeightM: 1.2, wavePeriodS: 10, waveDirectionDeg: 140, swellHeightM: 1.0, hourly: [] },
    sources: [],
  },
  error: null,
};
const errEnvelope = { success: false, data: null, error: { code: "LOCATION_NOT_FOUND", message: "Unknown locationId: xxx" } };

describe("lib/api envelope handling", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("fetchLocations unwraps success envelope", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => okLocations } as unknown as Response);
    const locs = await fetchLocations();
    expect(locs[0].id).toBe("ilha-comprida");
    expect((global.fetch as any).mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("fetchLocations throws with server message on success:false", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => errEnvelope } as unknown as Response);
    await expect(fetchLocations()).rejects.toThrow("Unknown locationId: xxx");
  });

  it("fetchForecast uses AbortSignal and unwraps", async () => {
    const spy = vi.fn().mockResolvedValue({ ok: true, json: async () => okForecast } as unknown as Response);
    global.fetch = spy as unknown as typeof fetch;
    const data = await fetchForecast("ilha-comprida");
    expect(data.surfScore).toBe(70);
    const url = spy.mock.calls[0][0] as URL;
    expect(url.toString()).toContain("locationId=ilha-comprida");
    const opts = spy.mock.calls[0][1] as RequestInit & { signal: AbortSignal };
    expect(opts.signal).toBeInstanceOf(AbortSignal);
  });

  it("fetchForecast throws HTTP message on error envelope", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({ success: false, data: null, error: { code: "FORECAST_UNAVAILABLE", message: "Open-Meteo and Marine both failed" } }) } as unknown as Response);
    await expect(fetchForecast("ilha-comprida")).rejects.toThrow("Open-Meteo and Marine both failed");
  });
});
