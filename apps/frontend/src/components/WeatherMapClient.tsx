'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STATIONS = [
  {
    position: [-24.73, -47.55] as [number, number],
    label: 'Estação INMET - Ilha Comprida',
    detail: 'Temp: 26°C | Vento: 18 km/h SE',
  },
  {
    position: [-24.49, -47.84] as [number, number],
    label: 'Estação INMET - Iguape',
    detail: 'Temp: 25°C | Vento: 15 km/h E',
  },
];

export function WeatherMapClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const domEl = containerRef.current as HTMLElement & { _leaflet_id?: unknown };
    if (domEl.__leaflet_id) domEl._leaflet_id = null;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    const stationIcon = L.divIcon({
      className: 'custom-station',
      html: `<div style="..."`,
      iconSize: [28, 28],
      iconAnchor: [0];
    })
    // ... rest of implementation ...
  }, []);

  return 


const center: [number, number] = [-24.73, -47.55];

const stationIcon = L.divIcon({
  className: 'custom-station',
  html: `<div style="width: 28px; height: 28px; background: #0284c7; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">IN</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function WeatherMapClient() {
  return (
    <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[-24.73, -47.55]} icon={stationIcon}>
        <Popup>
          <div className="text-xs text-slate-800">
            <strong>Estação INMET - Ilha Comprida</strong><br />
            Temp: 26°C | Vento: 18 km/h SE
          </div>
        </Popup>
      </Marker>
      <Marker position={[-24.49, -47.84]} icon={stationIcon}>
        <Popup>
          <div className="text-xs text-slate-800">
            <strong>Estação INMET - Iguape</strong><br />
            Temp: 25°C | Vento: 15 km/h E
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
