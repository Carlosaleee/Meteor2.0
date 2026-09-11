'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CommerceItem } from '@/lib/api';

type LocalismoMapProps = {
  commerce: CommerceItem[];
  selectedCommerce: CommerceItem | null;
  route: { from: [number, number]; to: [number, number]; label: string } | null;
  onClearRoute: () => void;
};

const SECTOR_COLORS: Record<string, string> = {
  alimentacao: '#f97316',
  hospedagem: '#3b82f6',
  comercio: '#10b981',
  servicos: '#eab308',
  lazer: '#a855f7',
};

const SECTOR_EMOJI: Record<string, string> = {
  alimentacao: '🍽️',
  hospedagem: '🏨',
  comercio: '🛒',
  servicos: '🔧',
  lazer: '🎯',
};

const CENTER_ICOMPRIDA: [number, number] = [-24.7167, -47.5333];

export function LocalismoMap({ commerce, selectedCommerce, route, onClearRoute }: LocalismoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const domEl = containerRef.current as HTMLElement & { _leaflet_id?: unknown };
    if (domEl._leaflet_id) domEl._leaflet_id = null;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: CENTER_ICOMPRIDA,
      zoom: 12,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    commerce.forEach(c => {
      const color = SECTOR_COLORS[c.sector] ?? '#64748b';
      const emoji = SECTOR_EMOJI[c.sector] ?? '📍';
      const isSelected = selectedCommerce?.id === c.id;
      const size = isSelected ? 40 : 32;

      const icon = L.divIcon({
        className: 'localismo-spot',
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid ${isSelected ? '#06b6d4' : 'white'};border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:${isSelected ? 18 : 14}px;">${emoji}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([c.lat, c.lon], { icon })
        .bindPopup(`
          <div class="text-xs min-w-[180px]">
            <strong class="text-sm">${c.name}</strong><br/>
            <span class="text-slate-500">${c.subsector}</span><br/>
            <span class="text-slate-400">${c.address}</span><br/>
            ${c.phone !== 'Não informado' ? `<span class="text-slate-400">📞 ${c.phone}</span><br/>` : ''}
            <a href="${c.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline mt-1 inline-block">Abrir no Google Maps</a>
          </div>
        `)
        .addTo(map);

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
  }, [commerce]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => {
      const popup = marker.getPopup();
      if (popup) {
        marker.closePopup();
      }
    });

    if (selectedCommerce) {
      const marker = markersRef.current.find(m => {
        const latlng = m.getLatLng();
        return Math.abs(latlng.lat - selectedCommerce.lat) < 0.0001 &&
               Math.abs(latlng.lng - selectedCommerce.lon) < 0.0001;
      });
      if (marker) {
        marker.openPopup();
        mapRef.current.setView([selectedCommerce.lat, selectedCommerce.lon], 15, { animate: true });
      }
    }
  }, [selectedCommerce]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (route) {
      const line = L.polyline(
        [route.from, route.to],
        { color: '#06b6d4', weight: 4, dashArray: '8, 8', opacity: 0.8 }
      ).addTo(mapRef.current);

      line.bindTooltip(route.label, { permanent: true, direction: 'center', className: 'route-tooltip' });
      routeLineRef.current = line;

      mapRef.current.fitBounds(line.getBounds(), { padding: [50, 50] });
    }
  }, [route]);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden border border-slate-800" style={{ minHeight: '500px' }} />
      {route && (
        <button
          onClick={onClearRoute}
          className="absolute top-3 right-3 z-[1000] px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white hover:bg-slate-800 transition-colors"
        >
          ✕ Fechar rota
        </button>
      )}
    </div>
  );
}
