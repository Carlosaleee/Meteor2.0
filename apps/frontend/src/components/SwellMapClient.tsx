'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SPOTS = [
  {
    position: [-24.75, -47.58] as [number, number],
    label: 'Boqueirão Norte — Ilha Comprida',
    detail: 'Nível: Intermediário<br>Melhor Vento: Terral (Oeste)',
  },
  {
    position: [-24.95, -47.88] as [number, number],
    label: 'Boqueirão Sul — Ilha Comprida',
    detail: 'Nível: Avançado<br>Melhor Vento: Sudoeste',
  },
];

export function SwellMapClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() =>
    {
    if (!containerRef.current) return;

    const domEl = containerRef.current as HTMLElement & { _leaflet_id?: unknown };
    if (domId
;







export function SwellMapClient() {
  return (
    <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[-24.75, -47.58]} icon={spotIcon}>
        <Popup>
          <div className="text-xs text-slate-800">
            <strong>Boqueirão Norte — Ilha Comprida</strong><br />
            Nível: Intermediário<br />
            Melhor Vento: Terral (Oeste)
          </div>
        </Popup>
      </Marker>
      <Marker position={[-24.95, -47.88]} icon={spotIcon}>
        <Popup>
          <div className="text-xs text-slate-800">
            <strong>Boqueirão Sul — Ilha Comprida</strong><br />
            Nível: Avançado<br />
            Melhor Vento: Sudoeste
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
