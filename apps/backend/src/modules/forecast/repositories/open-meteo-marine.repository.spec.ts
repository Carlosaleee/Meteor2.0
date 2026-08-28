import { OpenMeteoMarineRepository } from "./open-meteo-marine.repository";
import type { LocationRecord } from "../catalog/locations";

const loc: LocationRecord = {
  id: "ilha-comprida",
  name: "Ilha Comprida",
  region: "ilha-comprida",
  lat: -24.7389,
  lon: -47.5556,
  inmetStationId: "A712",
};

describe("OpenMeteoMarineRepository", () => {
  const repo = new OpenMeteoMarineRepository();
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("maps marine current + hourly", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { wave_height: 1.2, wave_period: 10, wave_direction: 140, swell_wave_height: 1.1 },
        hourly: { time: ["t"], wave_height: [1.0] },
      }),
    } as unknown as Response);
    const res = await repo.fetchMarine(loc, 3);
    expect(res.status).toBe("ok");
    expect(res.data?.waveHeightM).toBe(1.2);
    expect(res.data?.hourly[0].waveHeightM).toBe(1.0);
  });

  it("propagates days to forecast_days", async () => {
    const spy = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: {}, hourly: { time: [] } }),
    } as unknown as Response);
    global.fetch = spy;
    await repo.fetchMarine(loc, 7);
    const url = spy.mock.calls[0][0] as URL;
    expect(url.searchParams.get("forecast_days")).toBe("7");
  });

  it("error on !ok and network", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 502 } as unknown as Response);
    expect((await repo.fetchMarine(loc, 3)).status).toBe("error");
    global.fetch = jest.fn().mockRejectedValue(new Error("x"));
    expect((await repo.fetchMarine(loc, 3)).message).toBe("network");
  });
});
