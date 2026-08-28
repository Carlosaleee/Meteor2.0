import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../../../common/config/env.schema";
import type { LocationRecord } from "../catalog/locations";
import type { InmetSnapshot, ProviderResult } from "../providers/forecast-provider.types";

type InmetRow = {
  DT_MEDICAO?: string;
  HR_MEDICAO?: string;
  TEM_INS?: string;
  UMD_INS?: string;
  VEN_VEL?: string;
};

@Injectable()
export class InmetRepository {
  private readonly logger = new Logger(InmetRepository.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  async fetchStation(location: LocationRecord): Promise<ProviderResult<InmetSnapshot>> {
    const base = this.config.get("INMET_BASE_URL", { infer: true }).replace(/\/$/, "");
    const token = this.config.get("INMET_API_TOKEN", { infer: true });
    const today = new Date().toISOString().slice(0, 10);
    const url = `${base}/estacao/${today}/${today}/${location.inmetStationId}`;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        return {
          id: "inmet",
          status: "error",
          data: null,
          message: `HTTP ${response.status}`,
        };
      }
      const json = (await response.json()) as InmetRow[] | { error?: string };
      if (!Array.isArray(json) || json.length === 0) {
        return { id: "inmet", status: "error", data: null, message: "empty" };
      }
      const last = json[json.length - 1];
      return {
        id: "inmet",
        status: "ok",
        data: {
          stationId: location.inmetStationId,
          temperatureC: this.toNumber(last.TEM_INS),
          humidityPct: this.toNumber(last.UMD_INS),
          windSpeedMs: this.toNumber(last.VEN_VEL),
          observedAt: `${last.DT_MEDICAO ?? ""}T${last.HR_MEDICAO ?? ""}`,
        },
      };
    } catch (error) {
      this.logger.warn(`INMET failed: ${String(error)}`);
      return { id: "inmet", status: "error", data: null, message: "network" };
    }
  }

  private toNumber(value: string | undefined): number | null {
    if (value === undefined || value === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
