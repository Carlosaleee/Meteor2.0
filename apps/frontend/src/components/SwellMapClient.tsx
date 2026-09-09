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

  useEffect(() => {
    if (!containerRef.current) return;

    const domEl = containerRef.current as HTMLElement & { _leaflet_id?: unknown };
    if (domEl._leaflet_id) {
      domEl._leaflet_id = null;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const spotIcon = L.divIcon({
      className: 'custom-spot',
      html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#10b981,#059669);border:3px solid white;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;">🌊</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const map = L.map(containerRef.current, {
      center: [-24.85, -47.72],
      zoom: 11,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    SPOTS.forEach(s => {
      L.marker(s.position, { icon: spotIcon })
        .bindPopup(`<div class="text-xs"><strong>${s.label}</strong><br>${s.detail}</div>`)
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: '400px' }} />;
}

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const center: [number, number] = [-24.85, -47.72];

const spotIcon = L.divIcon({
  className: 'custom-spot',
  html: `<div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10b981, #059669); border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">🌊</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

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
