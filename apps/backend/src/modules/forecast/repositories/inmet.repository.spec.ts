import { ConfigService } from "@nestjs/config";
import { InmetRepository } from "./inmet.repository";
import type { LocationRecord } from "../catalog/locations";

const loc: LocationRecord = {
  id: "ilha-comprida",
  name: "Ilha Comprida",
  region: "ilha-comprida",
  lat: -24.7389,
  lon: -47.5556,
  inmetStationId: "A712",
};

function cfg(token = "", base = "https://apitempo.inmet.gov.br"): ConfigService {
  return {
    get: (key: string) => (key === "INMET_API_TOKEN" ? token : key === "INMET_BASE_URL" ? base : ""),
  } as unknown as ConfigService<any, true>;
}

describe("InmetRepository", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("removes replaceAll no-op and uses YYYY-MM-DD", async () => {
    const repo = new InmetRepository(cfg());
    const spy = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ DT_MEDICAO: "2026/08/28", HR_MEDICAO: "12:00", TEM_INS: "24", UMD_INS: "80", VEN_VEL: "3" }],
    } as unknown as Response);
    global.fetch = spy;
    await repo.fetchStation(loc);
    const url = spy.mock.calls[0][0] as string;
    expect(url).toMatch(/\/estacao\/\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}\/A712/);
    expect(url).not.toContain("--");
  });

  it("maps TEM_INS/UMD_INS/VEN_VEL and observedAt", async () => {
    const repo = new InmetRepository(cfg());
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ DT_MEDICAO: "2026-08-28", HR_MEDICAO: "12:00", TEM_INS: "22.5", UMD_INS: "78", VEN_VEL: "2.1" }],
    } as unknown as Response);
    const res = await repo.fetchStation(loc);
    expect(res.status).toBe("ok");
    expect(res.data?.temperatureC).toBe(22.5);
    expect(res.data?.humidityPct).toBe(78);
    expect(res.data?.windSpeedMs).toBe(2.1);
    expect(res.data?.observedAt).toBe("2026-08-28T12:00");
  });

  it("sends Bearer token when present and timeout signal", async () => {
    const repo = new InmetRepository(cfg("my-token"));
    const spy = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ DT_MEDICAO: "2026-08-28", HR_MEDICAO: "12:00", TEM_INS: "20", UMD_INS: "80", VEN_VEL: "2" }],
    } as unknown as Response);
    global.fetch = spy;
    await repo.fetchStation(loc);
    const opts = spy.mock.calls[0][1] as RequestInit & { headers: Record<string, string>; signal: AbortSignal };
    expect(opts.headers.Authorization).toBe("Bearer my-token");
    expect(opts.signal).toBeInstanceOf(AbortSignal);
  });

  it("error on !ok, empty array, network", async () => {
    const repo = new InmetRepository(cfg());
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 } as unknown as Response);
    expect((await repo.fetchStation(loc)).status).toBe("error");
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] } as unknown as Response);
    expect((await repo.fetchStation(loc)).message).toBe("empty");
    global.fetch = jest.fn().mockRejectedValue(new Error("net"));
    expect((await repo.fetchStation(loc)).message).toBe("network");
  });
});
