"use client";

import dynamic from "next/dynamic";
// @ts-ignore — leaflet CSS has no types, needed for map tiles
import "leaflet/dist/leaflet.css";



type Spot = { id: string; name: string; lat: number; lon: number; region: string };

const SPOTS: Spot[] = [
  { id: "ilha-comprida", name: "Ilha Comprida", lat: -24.7389, lon: -47.5556, region: "ilha-comprida" },
  { id: "iguape", name: "Iguape", lat: -24.7081, lon: -47.5553, region: "ilha-comprida" },
  { id: "cananeia", name: "Cananeia", lat: -25.0147, lon: -47.9267, region: "vale-do-ribeira" },
  { id: "registro", name: "Registro", lat: -24.4879, lon: -47.8437, region: "vale-do-ribeira" },
  { id: "jacupiranga", name: "Jacupiranga", lat: -24.6925, lon: -48.0536, region: "vale-do-ribeira" },
  { id: "cajati", name: "Cajati", lat: -24.7361, lon: -48.1228, region: "vale-do-ribeira" },
];

export function SpotMap() {
  return (
    <div className="border border-line bg-graphite p-3">
      <div className="mb-2 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Mapa — Ilha Comprida / Vale do Ribeira — OSM</div>
      <div className="h-[420px] w-full overflow-hidden border border-line">
        {/* @ts-ignore — react-leaflet types mismatch with dynamic import */}
        <MapContainer center={[-24.7, -47.8] as unknown as never} zoom={8} style={{ height: "100%", width: "100%" } as never} scrollWheelZoom={false}>
          {/* @ts-ignore */}
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {SPOTS.map((s) => (
            // @ts-ignore
            <Marker key={s.id} position={[s.lat, s.lon] as unknown as never}>
              {/* @ts-ignore */}
              <Popup>
                <div className="font-mono text-xs">
                  <strong>{s.name}</strong> — {s.region}
                  <br />
                  {s.lat.toFixed(4)}, {s.lon.toFixed(4)}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
