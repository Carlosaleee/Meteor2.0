export type ProviderStatus = "ok" | "error" | "disabled";

export type ProviderResult<T> = {
  id: "open-meteo" | "open-meteo-marine" | "stormglass" | "inmet";
  status: ProviderStatus;
  data: T | null;
  message?: string;
};

export type AtmosphereSnapshot = {
  temperatureC: number | null;
  windSpeedMs: number | null;
  windDirectionDeg: number | null;
  precipitationMm: number | null;
  hourly: Array<{ time: string; windSpeedMs: number; temperatureC: number }>;
};

export type MarineSnapshot = {
  waveHeightM: number | null;
  wavePeriodS: number | null;
  waveDirectionDeg: number | null;
  swellHeightM: number | null;
  hourly: Array<{ time: string; waveHeightM: number }>;
};

export type InmetSnapshot = {
  stationId: string;
  temperatureC: number | null;
  humidityPct: number | null;
  windSpeedMs: number | null;
  observedAt: string | null;
};
