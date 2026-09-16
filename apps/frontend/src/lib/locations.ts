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

export const SURF_SPOTS = [
  { id: 'jureia', name: 'Juréia', lat: -24.75, lon: -47.58, level: 'advanced' },
  { id: 'ponta-praia-norte', name: 'Ponta da Praia Norte', lat: -24.72, lon: -47.55, level: 'beginner' },
  { id: 'boqueirao-norte', name: 'Boqueirão Norte', lat: -24.74, lon: -47.56, level: 'intermediate' },
  { id: 'boqueirao-sul', name: 'Boqueirão Sul', lat: -24.76, lon: -47.57, level: 'advanced' },
  { id: 'costao-sul', name: 'Costão do Sul', lat: -24.77, lon: -47.58, level: 'intermediate' },
  { id: 'parada-surf', name: 'Parada do Surf', lat: -24.71, lon: -47.54, level: 'beginner' },
];
