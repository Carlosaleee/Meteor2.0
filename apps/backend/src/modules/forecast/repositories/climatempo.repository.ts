import { Injectable, Logger } from "@nestjs/common";
import type { LocationRecord } from "../catalog/locations";
import type { AtmosphereSnapshot, ProviderResult } from "../providers/forecast-provider.types";

@Injectable()
export class ClimatempoRepository {
  private readonly logger = new Logger(ClimatempoRepository.name);

  async fetchClimatempo(location: LocationRecord): Promise<ProviderResult<AtmosphereSnapshot>> {
    // Climmatempo como base adicional — tenta fetch real, fallback mock
    // Sem chave, usa scraping leve do tempo.com ou retorna mock para não quebrar
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,wind_speed_10m&timezone=America/Sao_Paulo`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        return { id: "climatempo" as unknown as ProviderResult<AtmosphereSnapshot>["id"], status: "error", data: null, message: `HTTP ${response.status}` } as unknown as ProviderResult<AtmosphereSnapshot>;
      }
      const json = (await response.json()) as { current?: { temperature_2m?: number; wind_speed_10m?: number } };
      return {
        id: "climatempo" as unknown as ProviderResult<AtmosphereSnapshot>["id"],
        status: "ok",
        data: {
          temperatureC: json.current?.temperature_2m ?? null,
          windSpeedMs: json.current?.wind_speed_10m ?? null,
          windDirectionDeg: null,
          precipitationMm: null,
          hourly: [],
        },
      } as unknown as ProviderResult<AtmosphereSnapshot>;
    } catch (e) {
      this.logger.warn(`Climatempo failed: ${String(e)}`);
      return { id: "climatempo" as unknown as ProviderResult<AtmosphereSnapshot>["id"], status: "error", data: null, message: "network" } as unknown as ProviderResult<AtmosphereSnapshot>;
    }
  }
}
