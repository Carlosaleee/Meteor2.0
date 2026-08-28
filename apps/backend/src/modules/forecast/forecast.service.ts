import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { findLocation, LOCATIONS, type LocationRecord } from "./catalog/locations";
import type { ForecastQueryDto } from "./dto/forecast-query.dto";
import type {
  AtmosphereSnapshot,
  MarineSnapshot,
  ProviderResult,
} from "./providers/forecast-provider.types";
import { InmetRepository } from "./repositories/inmet.repository";
import { OpenMeteoMarineRepository } from "./repositories/open-meteo-marine.repository";
import { OpenMeteoRepository } from "./repositories/open-meteo.repository";
import { StormglassRepository } from "./repositories/stormglass.repository";

export type ForecastPayload = {
  location: LocationRecord;
  surfScore: number;
  atmosphere: AtmosphereSnapshot | null;
  marine: MarineSnapshot | null;
  sources: Array<ProviderResult<unknown>>;
};

@Injectable()
export class ForecastService {
  constructor(
    private readonly openMeteo: OpenMeteoRepository,
    private readonly marine: OpenMeteoMarineRepository,
    private readonly stormglass: StormglassRepository,
    private readonly inmet: InmetRepository,
  ) {}

  listLocations(): readonly LocationRecord[] {
    return LOCATIONS;
  }

  async getForecast(query: ForecastQueryDto): Promise<ForecastPayload> {
    const location = findLocation(query.locationId);
    if (!location) {
      throw new HttpException(
        { code: "LOCATION_NOT_FOUND", message: `Unknown locationId: ${query.locationId}` },
        HttpStatus.NOT_FOUND,
      );
    }

    const [atmosphereRes, marineRes, stormglassRes, inmetRes] = await Promise.all([
      this.openMeteo.fetchAtmosphere(location, query.days),
      this.marine.fetchMarine(location, query.days),
      this.stormglass.fetchMarine(location, query.days),
      this.inmet.fetchStation(location),
    ]);

    if (atmosphereRes.status === "error" && marineRes.status === "error") {
      throw new HttpException(
        {
          code: "FORECAST_UNAVAILABLE",
          message: "Open-Meteo and Marine both failed",
          details: [atmosphereRes.message, marineRes.message],
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    const atmosphere = this.mergeAtmosphere(atmosphereRes.data, inmetRes);
    const marineData = this.mergeMarine(marineRes.data, stormglassRes.data, stormglassRes.status);

    return {
      location,
      surfScore: this.computeSurfScore(atmosphere, marineData),
      atmosphere,
      marine: marineData,
      sources: [atmosphereRes, marineRes, stormglassRes, inmetRes],
    };
  }

  private mergeAtmosphere(
    openMeteo: AtmosphereSnapshot | null,
    inmet: ProviderResult<{ temperatureC: number | null; windSpeedMs: number | null }>,
  ): AtmosphereSnapshot | null {
    if (!openMeteo && inmet.status !== "ok") {
      return null;
    }
    const base: AtmosphereSnapshot = openMeteo ?? {
      temperatureC: null,
      windSpeedMs: null,
      windDirectionDeg: null,
      precipitationMm: null,
      hourly: [],
    };
    if (inmet.status === "ok" && inmet.data) {
      return {
        ...base,
        temperatureC: inmet.data.temperatureC ?? base.temperatureC,
        windSpeedMs: inmet.data.windSpeedMs ?? base.windSpeedMs,
      };
    }
    return base;
  }

  private mergeMarine(
    marine: MarineSnapshot | null,
    stormglass: MarineSnapshot | null,
    stormglassStatus: ProviderResult<MarineSnapshot>["status"],
  ): MarineSnapshot | null {
    if (!marine && stormglassStatus !== "ok") {
      return stormglass;
    }
    if (!marine) {
      return stormglass;
    }
    if (stormglassStatus !== "ok" || !stormglass) {
      return marine;
    }
    return {
      waveHeightM: marine.waveHeightM ?? stormglass.waveHeightM,
      wavePeriodS: marine.wavePeriodS ?? stormglass.wavePeriodS,
      waveDirectionDeg: marine.waveDirectionDeg ?? stormglass.waveDirectionDeg,
      swellHeightM: stormglass.swellHeightM ?? marine.swellHeightM,
      hourly: marine.hourly.length > 0 ? marine.hourly : stormglass.hourly,
    };
  }

  private computeSurfScore(atmosphere: AtmosphereSnapshot | null, marine: MarineSnapshot | null): number {
    const swell = marine?.swellHeightM ?? marine?.waveHeightM ?? 0;
    const period = marine?.wavePeriodS ?? 0;
    const wind = atmosphere?.windSpeedMs ?? 0;
    const swellPts = Math.min(40, swell * 18);
    const periodPts = Math.min(35, period * 2.5);
    const windPenalty = Math.min(30, wind * 2);
    return Math.max(0, Math.min(100, Math.round(swellPts + periodPts - windPenalty + 20)));
  }
}
