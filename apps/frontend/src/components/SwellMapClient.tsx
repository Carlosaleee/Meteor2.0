'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SPOTS = [
  {
    position: [-24.75, -47.58] as [number, number],
    label: 'Boqueirão Norte',
    detail: 'Nível: Intermediário<br>Melhor Vento: Terral (Oeste)<br>Exposição: Sul/Sudeste',
    level: 'intermediate' as const,
  },
  {
    position: [-24.95, -47.88] as [number, number],
    label: 'Boqueirão Sul',
    detail: 'Nível: Avançado<br>Melhor Vento: Sudoeste<br>Exposição: Sul',
    level: 'advanced' as const,
  },
  {
    position: [-24.78, -47.62] as [number, number],
    label: 'Costão do Sul',
    detail: 'Nível: Iniciante<br>Melhor Vento: Norte<br>Exposição: Leste',
    level: 'beginner' as const,
  },
  {
    position: [-24.72, -47.53] as [number, number],
    label: 'ILHA30',
    detail: 'Nível: Intermediário<br>Melhor Vento: Leste<br>Exposição: Leste',
    level: 'intermediate' as const,
  },
  {
    position: [-24.76, -47.50] as [number, number],
    label: 'Praia do Leste',
    detail: 'Nível: Iniciante<br>Melhor Vento: Norte<br>Exposição: Atlântico aberto',
    level: 'beginner' as const,
  },
  {
    position: [-24.85, -47.65] as [number, number],
    label: 'Barra do Ribeira',
    detail: 'Nível: Intermediário<br>Melhor Vento: Oeste<br>Exposição: Sudeste',
    level: 'intermediate' as const,
  },
];

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: '🌱',
  intermediate: '🏄',
  advanced: '🔥',
};

export function SwellMapClient() {
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

    const map = L.map(containerRef.current, {
      center: [-24.80, -47.60],
      zoom: 11,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    SPOTS.forEach(s => {
      const color = LEVEL_COLORS[s.level] ?? '#10b981';
      const emoji = LEVEL_LABELS[s.level] ?? '🌊';
      const spotIcon = L.divIcon({
        className: 'custom-spot',
        html: `<div style="width:32px;height:32px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

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
