export type Location = {
  id: string;
  name: string;
  region: string;
};

export type SurfScoreData = {
  score?: number;
  level?: string;
  recommendation?: string;
  bestTime?: string;
};

export type Forecast = {
  sources?: { id: string; name: string; status: "ok" | "error" | "disabled" }[];
  atmosphere?: {
    windSpeedMs?: number | null;
    windDirectionDeg?: number | null;
    temperatureC?: number | null;
  };
  marine?: {
    swellHeightM?: number | null;
    wavePeriodS?: number | null;
    waveHeightM?: number | null;
  };
  surfScore?: SurfScoreData;
};
