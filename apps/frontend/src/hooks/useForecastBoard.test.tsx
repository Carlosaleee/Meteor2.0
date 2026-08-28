import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForecastBoard } from "./useForecastBoard";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  fetchLocations: vi.fn(),
  fetchForecast: vi.fn(),
  fetchAiSummary: vi.fn(),
}));

const locations = [
  { id: "ilha-comprida", name: "Ilha Comprida", region: "ilha-comprida", lat: -24.7, lon: -47.5, inmetStationId: "A712" },
  { id: "cananeia", name: "Cananeia", region: "vale-do-ribeira", lat: -25.0, lon: -47.9, inmetStationId: "A746" },
];

const forecast = {
  location: locations[0],
  surfScore: 72,
  atmosphere: { temperatureC: 24, windSpeedMs: 3, windDirectionDeg: 180, precipitationMm: 0, hourly: [] },
  marine: { waveHeightM: 1.2, wavePeriodS: 10, waveDirectionDeg: 140, swellHeightM: 1.0, hourly: [{ time: "t", waveHeightM: 1.2 }] },
  sources: [{ id: "open-meteo", status: "ok", data: {}, message: undefined }],
} as any;

describe("useForecastBoard", () => {
  beforeEach(() => {
    vi.mocked(api.fetchLocations).mockResolvedValue(locations as any);
    vi.mocked(api.fetchForecast).mockResolvedValue(forecast);
    vi.mocked(api.fetchAiSummary).mockResolvedValue("Vento ok, swell 1m.");
  });

  it("loads locations on mount", async () => {
    const { result } = renderHook(() => useForecastBoard());
    await waitFor(() => expect(result.current.locations).toHaveLength(2));
    expect(api.fetchLocations).toHaveBeenCalled();
  });

  it("loads forecast + summary for default ilha-comprida", async () => {
    const { result } = renderHook(() => useForecastBoard());
    await waitFor(() => expect(result.current.forecast).not.toBeNull());
    expect(result.current.forecast?.surfScore).toBe(72);
    expect(result.current.summary).toContain("Vento");
    expect(result.current.loading).toBe(false);
  });

  it("switches city via setLocationId", async () => {
    const { result } = renderHook(() => useForecastBoard());
    await waitFor(() => expect(result.current.forecast).not.toBeNull());
    const cananeiaForecast = { ...forecast, location: locations[1], surfScore: 55 } as any;
    vi.mocked(api.fetchForecast).mockResolvedValueOnce(cananeiaForecast);
    vi.mocked(api.fetchAiSummary).mockResolvedValueOnce("Cananeia ok.");
    await act(async () => {
      result.current.setLocationId("cananeia");
    });
    await waitFor(() => expect(result.current.forecast?.location.id).toBe("cananeia"));
    expect(api.fetchForecast).toHaveBeenCalledWith("cananeia");
  });

  it("sets error on fetchForecast failure with detail", async () => {
    vi.mocked(api.fetchForecast).mockRejectedValueOnce(new Error("HTTP 502"));
    const { result } = renderHook(() => useForecastBoard());
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toMatch(/LINK DOWN/);
    expect(result.current.forecast).toBeNull();
  });
});
