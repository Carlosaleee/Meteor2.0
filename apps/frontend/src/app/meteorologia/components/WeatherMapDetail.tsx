'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MeteorologyResponse } from '@/lib/api';
import { weatherDescription, windDirection } from './weather-utils';

type WeatherMapDetailProps = {
  data: MeteorologyResponse;
};

const CITY_COORDS: Record<string, { lat: number; lon: number; name: string; ctecUrl: string }> = {
  'ilha-comprida': { lat: -24.73, lon: -47.55, name: 'Ilha Comprida', ctecUrl: 'https://www.cptec.inpe.br/' },
  'iguape': { lat: -24.70, lon: -47.55, name: 'Iguape', ctecUrl: 'https://www.cptec.inpe.br/' },
  'cananeia': { lat: -25.01, lon: -47.92, name: 'Cananéia', ctecUrl: 'https://www.cptec.inpe.br/' },
  'registro': { lat: -24.48, lon: -47.84, name: 'Registro', ctecUrl: 'https://www.cptec.inpe.br/' },
};

function createStationIcon(isActive: boolean): L.DivIcon {
  const bg = isActive ? '#d97706' : '#475569';
  const shadow = isActive ? '0 4px 16px rgba(217,119,6,0.5)' : '0 2px 8px rgba(0,0,0,0.3)';
  const border = isActive ? '3px solid #fbbf24' : '2px solid white';
  const size = isActive ? 36 : 28;
  return L.divIcon({
    className: 'station-icon',
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border:${border};border-radius:50%;box-shadow:${shadow};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:${isActive ? 11 : 9}px;">${isActive ? '📍' : 'IN'}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function WeatherMapDetail({ data }: WeatherMapDetailProps) {
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
      center: [-24.75, -47.70],
      zoom: 10,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // RainViewer radar layer
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(radarData => {
        const latestPast = radarData?.rain?.past?.slice(-1)?.[0];
        if (latestPast) {
          L.tileLayer(
            `https://tilecache.rainviewer.com${latestPast.path}/512/{z}/{x}/{y}/2/1_1.png`,
            { opacity: 0.5, maxZoom: 7, attribution: '&copy; RainViewer' }
          ).addTo(map);
        }
      })
      .catch(() => {
        // Radar unavailable, continue without it
      });

    Object.entries(CITY_COORDS).forEach(([id, city]) => {
      const isActive = data.locationId === id;
      const icon = createStationIcon(isActive);

      const popupHtml = isActive
        ? `<div style="font-size:12px;min-width:160px;font-family:system-ui;">
            <strong style="font-size:13px;">${city.name}</strong><br>
            <span style="color:#d97706;">📍 Localização atual</span><br><br>
            🌡️ ${Math.round(data.current.temperature)}°C<br>
            💧 ${data.current.humidity}%<br>
            💨 ${Math.round(data.current.windSpeed)}km/h ${windDirection(data.current.windDirection)}<br>
            ☁️ ${weatherDescription(data.current.weatherCode)}<br><br>
            <a href="https://www.cptec.inpe.br/" target="_blank" style="color:#0ea5e9;font-size:11px;">Previsão completa no CPTEC →</a>
          </div>`
        : `<div style="font-size:12px;font-family:system-ui;">
            <strong>${city.name}</strong><br>
            Clique para selecionar
          </div>`;

      const marker = L.marker([city.lat, city.lon], { icon })
        .bindPopup(popupHtml)
        .addTo(map);

      if (isActive) {
        marker.openPopup();
      }
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ minHeight: '400px' }}
        role="img"
        aria-label={`Mapa meteorológico com radar de chuva e estações em Ilha Comprida, Iguape, Cananéia e Registro. Dados atuais de ${data.location}: ${Math.round(data.current.temperature)} graus Celsius.`}
      />
      <div className="absolute bottom-2 right-2 z-[1000] bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 text-[10px] text-slate-400 backdrop-blur-sm">
        <span className="text-cyan-400 font-medium">Radar:</span> RainViewer · <span className="text-slate-500">Dados em tempo real</span>
      </div>
    </div>
  );
}
