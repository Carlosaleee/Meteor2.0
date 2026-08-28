import { ConfigService } from "@nestjs/config";
import type { Env } from "../../../common/config/env.schema";
import { StormglassRepository } from "./stormglass.repository";
import type { LocationRecord } from "../catalog/locations";

const loc: LocationRecord = {
  id: "cananeia",
  name: "Cananeia",
  region: "vale-do-ribeira",
  lat: -25.0147,
  lon: -47.9267,
  inmetStationId: "A746",
};

function configWith(key: string): ConfigService<Env, true> {
  return {
    get: (() => key) as unknown as ConfigService<Env, true>["get"],
  } as unknown as ConfigService<Env, true>;
}

describe("StormglassRepository", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("returns disabled when key unset", async () => {
    const repo = new StormglassRepository(configWith(""));
    const res = await repo.fetchMarine(loc);
    expect(res.status).toBe("disabled");
    expect(res.id).toBe("stormglass");
  });

  it("maps wave sg and slices days*24", async () => {
    const repo = new StormglassRepository(configWith("secret"));
    const hours = Array.from({ length: 72 }, (_, i) => ({
      time: `2026-08-28T${String(i).padStart(2, "0")}:00:00Z`,
      waveHeight: { sg: 1 + i * 0.01 },
      wavePeriod: { sg: 9 },
      waveDirection: { sg: 140 },
      swellHeight: { sg: 0.9 },
    }));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hours }),
    } as unknown as Response);

    const res3 = await repo.fetchMarine(loc, 3);
    expect(res3.status).toBe("ok");
    expect(res3.data?.hourly).toHaveLength(72);
    const res1 = await repo.fetchMarine(loc, 1);
    expect(res1.data?.hourly).toHaveLength(24);
    expect(res1.data?.waveHeightM).toBe(1);
  });

  it("uses Authorization header and timeout", async () => {
    const repo = new StormglassRepository(configWith("k123"));
    const spy = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hours: [{ waveHeight: { sg: 1 } }] }),
    } as unknown as Response);
    global.fetch = spy;
    await repo.fetchMarine(loc, 1);
    const opts = spy.mock.calls[0][1] as RequestInit & { headers: Record<string, string>; signal: AbortSignal };
    expect(opts.headers.Authorization).toBe("k123");
    expect(opts.signal).toBeInstanceOf(AbortSignal);
  });

  it("error on !ok and network", async () => {
    const repo = new StormglassRepository(configWith("k"));
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 } as unknown as Response);
    expect((await repo.fetchMarine(loc)).status).toBe("error");
    global.fetch = jest.fn().mockRejectedValue(new Error("net"));
    expect((await repo.fetchMarine(loc)).message).toBe("network");
  });
});
