import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { LocationRecord } from "../catalog/locations";
import type { MarineSnapshot, ProviderResult } from "../providers/forecast-provider.types";
import type { Env } from "../../../common/config/env.schema";

type StormglassHour = {
  time?: string;
  waveHeight?: { sg?: number };
  wavePeriod?: { sg?: number };
  waveDirection?: { sg?: number };
  swellHeight?: { sg?: number };
};

type StormglassResponse = {
  hours?: StormglassHour[];
};

@Injectable()
export class StormglassRepository {
  private readonly logger = new Logger(StormglassRepository.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  isEnabled(): boolean {
    return this.config.get("STORMGLASS_API_KEY", { infer: true }).length > 0;
  }

  async fetchMarine(location: LocationRecord, days = 3): Promise<ProviderResult<MarineSnapshot>> {
    const key = this.config.get("STORMGLASS_API_KEY", { infer: true });
    if (!key) {
      return { id: "stormglass", status: "disabled", data: null, message: "STORMGLASS_API_KEY unset" };
    }

    const params = new URLSearchParams({
      lat: String(location.lat),
      lng: String(location.lon),
      params: "waveHeight,wavePeriod,waveDirection,swellHeight",
    });

    try {
      const response = await fetch(`https://api.stormglass.io/v2/weather/point?${params.toString()}`, {
        headers: { Authorization: key },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        return {
          id: "stormglass",
          status: "error",
          data: null,
          message: `HTTP ${response.status}`,
        };
      }
      const json = (await response.json()) as StormglassResponse;
      const hours = json.hours ?? [];
      const first = hours[0];
      const hourly = hours.slice(0, days * 24).map((hour) => ({
        time: hour.time ?? "",
        waveHeightM: hour.waveHeight?.sg ?? 0,
      }));

      return {
        id: "stormglass",
        status: "ok",
        data: {
          waveHeightM: first?.waveHeight?.sg ?? null,
          wavePeriodS: first?.wavePeriod?.sg ?? null,
          waveDirectionDeg: first?.waveDirection?.sg ?? null,
          swellHeightM: first?.swellHeight?.sg ?? null,
          hourly,
        },
      };
    } catch (error) {
      this.logger.warn(`Stormglass failed: ${String(error)}`);
      return { id: "stormglass", status: "error", data: null, message: "network" };
    }
  }
}
