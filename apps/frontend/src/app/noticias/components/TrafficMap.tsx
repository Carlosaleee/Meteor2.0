'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type TrafficRoute = {
  id: string;
  name: string;
  condition: string;
  description: string;
  updatedAt: string;
};

const CONDITION_COLORS: Record<string, string> = {
  LIVRE: '#10b981',
  MODERADO: '#f59e0b',
  LENTO: '#f97316',
  BLOQUEADO: '#ef4444',
  OPERACIONAL: '#06b6d4',
};

const ROUTE_PATHS: Record<string, { waypoints: [number, number][]; label: string }> = {
  'sp-222': {
    waypoints: [[-24.70, -47.55], [-24.85, -47.73], [-25.01, -47.93]],
    label: 'SP-222',
  },
  'sp-055': {
    waypoints: [[-24.49, -47.84], [-24.60, -47.72], [-24.70, -47.55]],
    label: 'SP-055',
  },
  'br-116': {
    waypoints: [[-24.30, -47.80], [-24.40, -47.82], [-24.49, -47.84]],
    label: 'BR-116',
  },
  'balsa-cananeia': {
    waypoints: [[-25.01, -47.93], [-24.90, -47.90], [-24.80, -47.88]],
    label: 'Balsa',
  },
};

type TrafficMapProps = {
  routes: TrafficRoute[];
};

export function TrafficMap({ routes }: TrafficMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-24.78, -47.58],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    map.attributionControl.setPosition('bottomleft');

    mapRef.current = map;
    layersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    layers.clearLayers();

    const conditionCounts: Record<string, number> = {};
    routes.forEach(r => {
      conditionCounts[r.condition] = (conditionCounts[r.condition] ?? 0) + 1;
    });

    routes.forEach(route => {
      const path = ROUTE_PATHS[route.id];
      if (!path) return;

      const color = CONDITION_COLORS[route.condition] ?? '#94a3b8';
      const polyline = L.polyline(path.waypoints, {
        color,
        weight: 5,
        opacity: 0.85,
        dashArray: route.condition === 'BLOQUEADO' ? '8, 6' : undefined,
      }).addTo(layers);

      const lastWp = path.waypoints[path.waypoints.length - 1];
      const marker = L.circleMarker(lastWp, {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(layers);

      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:180px">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">${route.name}</div>
          <div style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${color}22;color:${color};border:1px solid ${color}44;margin-bottom:6px">
            ${route.condition}
          </div>
          <div style="font-size:12px;color:#64748b;line-height:1.4">${route.description}</div>
        </div>
      `);
    });

    if (routes.length > 0) {
      const bounds = L.latLngBounds(
        Object.values(ROUTE_PATHS).flatMap(p => p.waypoints)
      );
      mapRef.current?.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [routes]);

  const conditionSummary = routes.reduce((acc, r) => {
    acc[r.condition] = (acc[r.condition] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border border-slate-800"
        style={{ height: 380 }}
      />
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl px-3 py-2 flex flex-wrap gap-2">
        {Object.entries(CONDITION_COLORS).map(([condition, color]) => {
          const count = conditionSummary[condition] ?? 0;
          if (count === 0) return null;
          return (
            <div key={condition} className="flex items-center gap-1.5 text-[11px]">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-slate-300 font-medium">
                {condition} ({count})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
