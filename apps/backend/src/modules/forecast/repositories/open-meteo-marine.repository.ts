import { Injectable, Logger } from "@nestjs/common";
import type { LocationRecord } from "../catalog/locations";
import type { MarineSnapshot, ProviderResult } from "../providers/forecast-provider.types";

type MarineResponse = {
  current?: {
    wave_height?: number;
    wave_period?: number;
    wave_direction?: number;
    swell_wave_height?: number;
  };
  hourly?: {
    time?: string[];
    wave_height?: number[];
  };
};

@Injectable()
export class OpenMeteoMarineRepository {
  private readonly logger = new Logger(OpenMeteoMarineRepository.name);

  async fetchMarine(location: LocationRecord, days: number): Promise<ProviderResult<MarineSnapshot>> {
    const url = new URL("https://marine-api.open-meteo.com/v1/marine");
    url.searchParams.set("latitude", String(location.lat));
    url.searchParams.set("longitude", String(location.lon));
    url.searchParams.set("current", "wave_height,wave_period,wave_direction,swell_wave_height");
    url.searchParams.set("hourly", "wave_height");
    url.searchParams.set("forecast_days", String(days));
    url.searchParams.set("timezone", "America/Sao_Paulo");

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        return {
          id: "open-meteo-marine",
          status: "error",
          data: null,
          message: `HTTP ${response.status}`,
        };
      }
      const json = (await response.json()) as MarineResponse;
      const times = json.hourly?.time ?? [];
      const hourly = times.map((time, index) => ({
        time,
        waveHeightM: json.hourly?.wave_height?.[index] ?? 0,
      }));

      return {
        id: "open-meteo-marine",
        status: "ok",
        data: {
          waveHeightM: json.current?.wave_height ?? null,
          wavePeriodS: json.current?.wave_period ?? null,
          waveDirectionDeg: json.current?.wave_direction ?? null,
          swellHeightM: json.current?.swell_wave_height ?? null,
          hourly,
        },
      };
    } catch (error) {
      this.logger.warn(`Marine failed: ${String(error)}`);
      return { id: "open-meteo-marine", status: "error", data: null, message: "network" };
    }
  }
}
