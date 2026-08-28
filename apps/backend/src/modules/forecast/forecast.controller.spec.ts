import { Test } from "@nestjs/testing";
import { CacheModule } from "@nestjs/cache-manager";
import { ForecastController } from "./forecast.controller";
import { ForecastService } from "./forecast.service";
import { OpenMeteoRepository } from "./repositories/open-meteo.repository";
import { OpenMeteoMarineRepository } from "./repositories/open-meteo-marine.repository";
import { StormglassRepository } from "./repositories/stormglass.repository";
import { InmetRepository } from "./repositories/inmet.repository";

describe("ForecastController integration", () => {
  let controller: ForecastController;
  let service: ForecastService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register({ ttl: 120 * 1000 })],
      controllers: [ForecastController],
      providers: [
        ForecastService,
        { provide: OpenMeteoRepository, useValue: { fetchAtmosphere: jest.fn() } },
        { provide: OpenMeteoMarineRepository, useValue: { fetchMarine: jest.fn() } },
        { provide: StormglassRepository, useValue: { fetchMarine: jest.fn(), isEnabled: jest.fn() } },
        { provide: InmetRepository, useValue: { fetchStation: jest.fn() } },
      ],
    }).compile();

    controller = moduleRef.get(ForecastController);
    service = moduleRef.get(ForecastService);
  });

  it("GET /v1/locations returns catalog", () => {
    const locs = controller.listLocations();
    expect(locs.length).toBeGreaterThanOrEqual(6);
    expect(locs.find((l) => l.id === "ilha-comprida")).toBeDefined();
  });

  it("GET /v1/forecast delegates to service with days", async () => {
    const spy = jest.spyOn(service, "getForecast").mockResolvedValue({
      location: { id: "ilha-comprida", name: "Ilha Comprida", region: "ilha-comprida", lat: -24.7, lon: -47.5, inmetStationId: "A712" },
      surfScore: 70,
      atmosphere: null,
      marine: null,
      sources: [],
    } as any);
    const result = await controller.getForecast({ locationId: "ilha-comprida", days: 3 });
    expect(spy).toHaveBeenCalledWith({ locationId: "ilha-comprida", days: 3 });
    expect(result.surfScore).toBe(70);
  });
});
