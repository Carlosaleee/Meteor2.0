const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function fetchAPI<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.success === false && json.error) {
    throw new Error(json.error.message ?? 'API request failed');
  }

  return json.data ?? json;
}

export type HourlyForecast = {
  time: string;
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  cloudCover: number;
  visibility: number;
};

export type DailyForecast = {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
};

export type MeteorologyResponse = {
  location: string;
  locationId: string;
  timestamp: string;
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    precipitation: number;
    weatherCode: number;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
};

export type OceanographyResponse = {
  location: string;
  timestamp: string;
  current: {
    waveHeight: number;
    wavePeriod: number;
    waveDirection: number;
    swellHeight: number;
    swellPeriod: number;
    swellDirection: number;
  };
  qualityLabel: string;
  qualityEmoji: string;
  bestTime: string;
  nextTide: string;
  tideCoefficient: number;
  spots: Array<{
    id: string;
    name: string;
    lat: number;
    lon: number;
    level: string;
    bestWind: string;
  }>;
};

export type TrafficRoute = {
  id: string;
  name: string;
  stretch: string;
  condition: string;
  description: string;
  updatedAt: number;
  waitTimeMinutes?: number;
};

export type TrafficResponse = {
  timestamp: string;
  location: string;
  routes: TrafficRoute[];
};
