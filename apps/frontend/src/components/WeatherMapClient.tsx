'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STATIONS = [
  {
    position: [-24.73, -47.55] as [number, number],
    label: 'Estação INMET — Ilha Comprida',
    detail: 'Principal · Estação costeira de referência',
    type: 'inmet' as const,
  },
  {
    position: [-24.70, -47.55] as [number, number],
    label: 'Estação INMET — Iguape',
    detail: 'Secundária · Zona estuarina',
    type: 'inmet' as const,
  },
  {
    position: [-25.01, -47.92] as [number, number],
    label: 'Estação Climatempo — Cananéia',
    detail: 'Costeira · Baía de Cananéia',
    type: 'climatempo' as const,
  },
  {
    position: [-24.48, -47.84] as [number, number],
    label: 'Estação INMET — Registro',
    detail: 'Interior · Vale do Ribeira',
    type: 'inmet' as const,
  },
  {
    position: [-24.69, -48.05] as [number, number],
    label: 'Estação Climatempo — Jacupiranga',
    detail: 'Interior · Serra do Mar',
    type: 'climatempo' as const,
  },
  {
    position: [-24.78, -47.50] as [number, number],
    label: 'Estação Praia do Leste',
    detail: 'Costeira · Exposição atlântica',
    type: 'climatempo' as const,
  },
];

export function WeatherMapClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const domEl = containerRef.current as HTMLElement & { _leaflet_id?: unknown };
    if (domEl._leaflet_id) domEl._leaflet_id = null;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const inmetIcon = L.divIcon({
      className: 'custom-station-inmet',
      html: `<div style="width:28px;height:28px;background:#0284c7;border:3px solid white;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:10px;">IN</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const climatempoIcon = L.divIcon({
      className: 'custom-station-ct',
      html: `<div style="width:28px;height:28px;background:#f59e0b;border:3px solid white;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:10px;">CT</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const map = L.map(containerRef.current, {
      center: [-24.75, -47.70],
      zoom: 10,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    STATIONS.forEach(s => {
      const icon = s.type === 'inmet' ? inmetIcon : climatempoIcon;
      L.marker(s.position, { icon })
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
