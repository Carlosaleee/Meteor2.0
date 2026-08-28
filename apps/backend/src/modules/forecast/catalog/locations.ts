export type LocationRecord = {
  id: string;
  name: string;
  region: "ilha-comprida" | "vale-do-ribeira";
  lat: number;
  lon: number;
  inmetStationId: string;
};

export const LOCATIONS: readonly LocationRecord[] = [
  {
    id: "ilha-comprida",
    name: "Ilha Comprida",
    region: "ilha-comprida",
    lat: -24.7389,
    lon: -47.5556,
    inmetStationId: "A712",
  },
  {
    id: "iguape",
    name: "Iguape",
    region: "vale-do-ribeira",
    lat: -24.7081,
    lon: -47.5553,
    inmetStationId: "A712",
  },
  {
    id: "cananeia",
    name: "Cananeia",
    region: "vale-do-ribeira",
    lat: -25.0147,
    lon: -47.9267,
    inmetStationId: "A746",
  },
  {
    id: "registro",
    name: "Registro",
    region: "vale-do-ribeira",
    lat: -24.4879,
    lon: -47.8437,
    inmetStationId: "A746",
  },
  {
    id: "jacupiranga",
    name: "Jacupiranga",
    region: "vale-do-ribeira",
    lat: -24.6925,
    lon: -48.0536,
    inmetStationId: "A746",
  },
  {
    id: "cajati",
    name: "Cajati",
    region: "vale-do-ribeira",
    lat: -24.7361,
    lon: -48.1228,
    inmetStationId: "A746",
  },
] as const;

export function findLocation(id: string): LocationRecord | undefined {
  return LOCATIONS.find((item) => item.id === id);
}
