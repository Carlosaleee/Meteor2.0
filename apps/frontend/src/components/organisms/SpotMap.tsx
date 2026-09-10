'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Spot = { id: string; name: string; lat: number; lon: number; region: string };

const SPOTS: Spot[] = [
  { id: 'ilha-comprida', name: 'Ilha Comprida', lat: -24.7389, lon: -47.5556, region: 'ilha-comprida' },
  { id: 'iguape', name: 'Iguape', lat: -24.7081, lon: -47.5553, region: 'ilha-comprida' },
  { id: 'cananeia', name: 'Cananéia', lat: -25.0147, lon: -47.9267, region: 'vale-do-ribeira' },
  { id: 'registro', name: 'Registro', lat: -24.4879, lon: -47.8437, region: 'vale-do-ribeira' },
  { id: 'jacupiranga', name: 'Jacupiranga', lat: -24.6925, lon: -48.0536, region: 'vale-do-ribeira' },
  { id: 'cajati', name: 'Cajati', lat: -24.7361, lon: -48.1228, region: 'vale-do-ribeira' },
];

export function SpotMap() {
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

    const spotIcon = L.divIcon({
      className: 'custom-spot',
      html: `<div style="width:28px;height:28px;background:#0284c7;border:3px solid white;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;">📍</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const map = L.map(containerRef.current, {
      center: [-24.75, -47.75],
      zoom: 9,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    SPOTS.forEach(s => {
      L.marker([s.lat, s.lon], { icon: spotIcon })
        .bindPopup(`<div class="text-xs"><strong>${s.name}</strong><br>Região: ${s.region}<br>${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}</div>`)
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
