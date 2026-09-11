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
    windSpeed: number;
    windDirection: number;
    windGust: number;
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
    exposure: string;
    howToGetThere: string;
  }>;
};

export type HourlyMarinePoint = {
  time: string;
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
};

export type HourlyMarineResponse = HourlyMarinePoint[];

export type AiSummaryResponse = {
  summary: string;
  cached: boolean;
};

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  url: string;
  description: string;
  image: string;
  category: 'WSL' | 'Paulista';
  publishedAt: string;
};

export type WslRankingEntry = {
  rank: number;
  name: string;
  country: string;
  points: number;
  trend: number;
};

export type WslEvent = {
  name: string;
  location: string;
  dates: string;
  status: 'Completed' | 'Standby' | 'Upcoming';
  tour: string;
};

export type NewsResponse = {
  news: NewsItem[];
  rankings: { men: WslRankingEntry[]; women: WslRankingEntry[] };
  events: WslEvent[];
  timestamp: string;
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

export type CommerceItem = {
  id: string;
  name: string;
  sector: string;
  subsector: string;
  lat: number;
  lon: number;
  address: string;
  description: string;
  phone: string;
  googleMapsUrl: string;
};

export type LocalismoResponse = {
  commerce: CommerceItem[];
  timestamp: string;
};
