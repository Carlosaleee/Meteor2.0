import { OpenMeteoRepository } from "./open-meteo.repository";
import type { LocationRecord } from "../catalog/locations";

const loc: LocationRecord = {
  id: "ilha-comprida",
  name: "Ilha Comprida",
  region: "ilha-comprida",
  lat: -24.7389,
  lon: -47.5556,
  inmetStationId: "A712",
};

describe("OpenMeteoRepository", () => {
  const repo = new OpenMeteoRepository();
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("maps current + hourly on ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature_2m: 24, wind_speed_10m: 3, wind_direction_10m: 180, precipitation: 0 },
        hourly: { time: ["2026-08-28T00:00"], temperature_2m: [23], wind_speed_10m: [2] },
      }),
    } as unknown as Response);

    const res = await repo.fetchAtmosphere(loc, 3);
    expect(res.status).toBe("ok");
    expect(res.data?.temperatureC).toBe(24);
    expect(res.data?.hourly).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("returns error on HTTP !ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 } as unknown as Response);
    const res = await repo.fetchAtmosphere(loc, 3);
    expect(res.status).toBe("error");
    expect(res.message).toMatch(/HTTP 500/);
  });

  it("returns error on network throw", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("net"));
    const res = await repo.fetchAtmosphere(loc, 3);
    expect(res.status).toBe("error");
    expect(res.message).toBe("network");
  });

  it("uses AbortSignal timeout 5000", async () => {
    const spy = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: {}, hourly: { time: [] } }),
    } as unknown as Response);
    global.fetch = spy;
    await repo.fetchAtmosphere(loc, 1);
    const opts = spy.mock.calls[0][1] as RequestInit & { signal: AbortSignal };
    expect(opts.signal).toBeInstanceOf(AbortSignal);
  });
});
