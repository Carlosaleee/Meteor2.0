'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type MapMarker = {
  position: [number, number];
  popupHtml?: string;
  iconHtml?: string;
};

type Props = {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
};

export function BaseLeafletMap({ center, zoom, markers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Limpeza de IDs anteriores do Leaflet no DOM para evitar duplicação
    const domEl = containerRef.current as HTMLElement & { _leaflet_id?: any };
    if (domEl._leaflet_id) {
      domEl._leaflet_id = null;
    }

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    try {
      const map = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      markers.forEach(m => {
        let markerIcon = new L.Icon.Default();
        if (m.iconHtml) {
          markerIcon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: m.iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
        }

        const marker = L.marker(m.position, { icon: markerIcon }).addTo(map);
        if (m.popupHtml) {
          marker.bindPopup(m.popupHtml);
        }
      });

      mapRef.current = map;
    } catch (err) {
      console.warn('Leaflet initialization warning:', err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (domEl._leaflet_id) {
        domEl._leaflet_id = null;
      }
    };
  }, [center, zoom, markers]);

  return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden z-0" style={{ minHeight: '400px' }} />;
}
