export type CityLocation = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

export const CITIES: Record<string, CityLocation> = {
  'ilha-comprida': { id: 'ilha-comprida', name: 'Ilha Comprida', lat: -24.73, lon: -47.55 },
  'iguape': { id: 'iguape', name: 'Iguape', lat: -24.70, lon: -47.55 },
  'cananeia': { id: 'cananeia', name: 'Cananeia', lat: -25.01, lon: -47.92 },
  'registro': { id: 'registro', name: 'Registro', lat: -24.48, lon: -47.84 },
};

export const DEFAULT_CITY = 'ilha-comprida';

export const SURF_CENTER = { lat: -24.73, lon: -47.55 };
