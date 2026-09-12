'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Spot } from '@/lib/spots-data';
import { LEVEL_CONFIG } from '@/lib/spots-data';

type SpotsMapProps = {
  spots: Spot[];
  selectedSpot: Spot | null;
  userPosition: [number, number] | null;
  onSelectSpot: (spot: Spot) => void;
  onClearRoute: () => void;
};

const CENTER_ILHA_COMPRIDA: [number, number] = [-24.78, -47.58];

export function SpotsMap({ spots, selectedSpot, userPosition, onSelectSpot, onClearRoute }: SpotsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const fetchRoute = useCallback(async (from: [number, number], to: [number, number]) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('OSRM route failed');
      const data = await res.json();
      if (data.routes?.[0]?.geometry?.coordinates) {
        const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number]
        );
        return coords;
      }
    } catch (err) {
      console.warn('OSRM routing failed:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const domEl = containerRef.current as HTMLElement & { _leaflet_id?: unknown };
    if (domEl._leaflet_id) domEl._leaflet_id = null;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: CENTER_ILHA_COMPRIDA,
      zoom: 11,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    spots.forEach(spot => {
      const cfg = LEVEL_CONFIG[spot.level] ?? LEVEL_CONFIG.beginner;
      const isSelected = selectedSpot?.id === spot.id;
      const size = isSelected ? 40 : 32;

      const icon = L.divIcon({
        className: 'spots-map-marker',
        html: `<div style="width:${size}px;height:${size}px;background:${spot.level === 'beginner' ? '#10b981' : spot.level === 'intermediate' ? '#f59e0b' : '#ef4444'};border:3px solid ${isSelected ? '#3b82f6' : 'white'};border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:${isSelected ? 18 : 14}px;">${cfg.emoji}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([spot.lat, spot.lon], { icon })
        .bindPopup(`
          <div class="text-xs min-w-[200px]">
            <strong class="text-sm">${spot.name}</strong><br/>
            <span style="color:${spot.level === 'beginner' ? '#10b981' : spot.level === 'intermediate' ? '#f59e0b' : '#ef4444'}">${cfg.emoji} ${cfg.label}</span><br/>
            <span class="text-slate-400">Vento: ${spot.bestWind}</span><br/>
            <span class="text-slate-400">Exposição: ${spot.exposure}</span><br/>
            <a href="${spot.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline mt-1 inline-block">Abrir no Google Maps</a>
          </div>
        `)
        .addTo(map);

      marker.on('click', () => onSelectSpot(spot));
      markersRef.current.push(marker);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [spots, onSelectSpot]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => {
      const popup = marker.getPopup();
      if (popup) marker.closePopup();
    });

    if (selectedSpot) {
      const marker = markersRef.current.find(m => {
        const latlng = m.getLatLng();
        return Math.abs(latlng.lat - selectedSpot.lat) < 0.0001 &&
               Math.abs(latlng.lng - selectedSpot.lon) < 0.0001;
      });
      if (marker) {
        marker.openPopup();
        mapRef.current.setView([selectedSpot.lat, selectedSpot.lon], 13, { animate: true });
      }
    }
  }, [selectedSpot]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (selectedSpot && userPosition) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      userMarkerRef.current = L.marker(userPosition, { icon: userIcon })
        .bindPopup('Sua localização')
        .addTo(mapRef.current);

      fetchRoute(userPosition, [selectedSpot.lat, selectedSpot.lon]).then(coords => {
        if (coords && mapRef.current) {
          const line = L.polyline(coords, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 6',
          }).addTo(mapRef.current);

          line.bindTooltip(`Rota até ${selectedSpot.name}`, {
            permanent: false,
            direction: 'center',
          });

          routeLineRef.current = line;
          mapRef.current.fitBounds(line.getBounds(), { padding: [50, 50] });
        }
      });
    }
  }, [selectedSpot, userPosition, fetchRoute]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-slate-800"
        style={{ height: '450px' }}
      />
      {selectedSpot && userPosition && (
        <button
          onClick={onClearRoute}
          className="absolute top-3 right-3 z-[1000] px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          title="Fechar rota e voltar à visão geral"
          aria-label="Fechar rota"
        >
          ✕ Fechar rota
        </button>
      )}
    </div>
  );
}
