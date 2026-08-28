import { Injectable, Logger } from "@nestjs/common";
import type { AtmosphereSnapshot, ProviderResult } from "../providers/forecast-provider.types";
import type { LocationRecord } from "../catalog/locations";

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    precipitation?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    wind_speed_10m?: number[];
  };
};

@Injectable()
export class OpenMeteoRepository {
  private readonly logger = new Logger(OpenMeteoRepository.name);

  async fetchAtmosphere(location: LocationRecord, days: number): Promise<ProviderResult<AtmosphereSnapshot>> {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(location.lat));
    url.searchParams.set("longitude", String(location.lon));
    url.searchParams.set("current", "temperature_2m,wind_speed_10m,wind_direction_10m,precipitation");
    url.searchParams.set("hourly", "temperature_2m,wind_speed_10m");
    url.searchParams.set("forecast_days", String(days));
    url.searchParams.set("wind_speed_unit", "ms");
    url.searchParams.set("timezone", "America/Sao_Paulo");

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return {
          id: "open-meteo",
          status: "error",
          data: null,
          message: `HTTP ${response.status}`,
        };
      }
      const json = (await response.json()) as OpenMeteoResponse;
      const hourlyTimes = json.hourly?.time ?? [];
      const hourly: AtmosphereSnapshot["hourly"] = hourlyTimes.map((time, index) => ({
        time,
        windSpeedMs: json.hourly?.wind_speed_10m?.[index] ?? 0,
        temperatureC: json.hourly?.temperature_2m?.[index] ?? 0,
      }));

      return {
        id: "open-meteo",
        status: "ok",
        data: {
          temperatureC: json.current?.temperature_2m ?? null,
          windSpeedMs: json.current?.wind_speed_10m ?? null,
          windDirectionDeg: json.current?.wind_direction_10m ?? null,
          precipitationMm: json.current?.precipitation ?? null,
          hourly,
        },
      };
    } catch (error) {
      this.logger.warn(`Open-Meteo failed: ${String(error)}`);
      return { id: "open-meteo", status: "error", data: null, message: "network" };
    }
  }
}
