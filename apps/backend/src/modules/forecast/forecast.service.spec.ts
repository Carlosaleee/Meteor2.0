import { HttpException } from "@nestjs/common";
import { ForecastService } from "./forecast.service";
import type { AtmosphereSnapshot, MarineSnapshot, ProviderResult } from "./providers/forecast-provider.types";
import { OpenMeteoRepository } from "./repositories/open-meteo.repository";
import { OpenMeteoMarineRepository } from "./repositories/open-meteo-marine.repository";
import { StormglassRepository } from "./repositories/stormglass.repository";
import { InmetRepository } from "./repositories/inmet.repository";

function atmosphereOk(): ProviderResult<AtmosphereSnapshot> {
  return {
    id: "open-meteo",
    status: "ok",
    data: {
      temperatureC: 24,
      windSpeedMs: 4,
      windDirectionDeg: 180,
      precipitationMm: 0,
      hourly: [],
    },
  };
}

function marineOk(): ProviderResult<MarineSnapshot> {
  return {
    id: "open-meteo-marine",
    status: "ok",
    data: {
      waveHeightM: 1.2,
      wavePeriodS: 10,
      waveDirectionDeg: 140,
      swellHeightM: 1.1,
      hourly: [{ time: "t", waveHeightM: 1.2 }],
    },
  };
}

describe("ForecastService", () => {
  const openMeteo = { fetchAtmosphere: jest.fn() } as unknown as OpenMeteoRepository;
  const marine = { fetchMarine: jest.fn() } as unknown as OpenMeteoMarineRepository;
  const stormglass = { fetchMarine: jest.fn() } as unknown as StormglassRepository;
  const inmet = { fetchStation: jest.fn() } as unknown as InmetRepository;
  const service = new ForecastService(openMeteo, marine, stormglass, inmet);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("merges INMET observations over Open-Meteo atmosphere", async () => {
    (openMeteo.fetchAtmosphere as jest.Mock).mockResolvedValue(atmosphereOk());
    (marine.fetchMarine as jest.Mock).mockResolvedValue(marineOk());
    (stormglass.fetchMarine as jest.Mock).mockResolvedValue({
      id: "stormglass",
      status: "disabled",
      data: null,
    });
    (inmet.fetchStation as jest.Mock).mockResolvedValue({
      id: "inmet",
      status: "ok",
      data: { stationId: "A712", temperatureC: 22, humidityPct: 80, windSpeedMs: 2, observedAt: "now" },
    });

    const result = await service.getForecast({ locationId: "ilha-comprida", days: 3 });
    expect(result.atmosphere?.temperatureC).toBe(22);
    expect(result.atmosphere?.windSpeedMs).toBe(2);
    expect(result.sources.find((s) => s.id === "stormglass")?.status).toBe("disabled");
    expect(result.surfScore).toBeGreaterThan(0);
  });

  it("throws when both required providers fail", async () => {
    (openMeteo.fetchAtmosphere as jest.Mock).mockResolvedValue({
      id: "open-meteo",
      status: "error",
      data: null,
    });
    (marine.fetchMarine as jest.Mock).mockResolvedValue({
      id: "open-meteo-marine",
      status: "error",
      data: null,
    });
    (stormglass.fetchMarine as jest.Mock).mockResolvedValue({
      id: "stormglass",
      status: "disabled",
      data: null,
    });
    (inmet.fetchStation as jest.Mock).mockResolvedValue({
      id: "inmet",
      status: "error",
      data: null,
    });

    await expect(service.getForecast({ locationId: "ilha-comprida", days: 1 })).rejects.toBeInstanceOf(
      HttpException,
    );
  });
});
