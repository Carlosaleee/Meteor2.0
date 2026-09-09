'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// @ts-expect-error leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const center: [number, number] = [-24.80, -47.80];

const trafficIcon = L.divIcon({
  className: 'custom-traffic',
  html: `<div style="width: 28px; height: 28px; background: #10b981; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">🚗</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function TrafficMapClient() {
  return (
    <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[-24.70, -47.90]} icon={trafficIcon}>
        <Popup>
          <div className="text-xs text-slate-800">
            <strong>SP-222 — Km 12</strong><br />
            Status: Tráfego Livre
          </div>
        </Popup>
      </Marker>
      <Marker position={[-24.90, -47.92]} icon={trafficIcon}>
        <Popup>
          <div className="text-xs text-slate-800">
            <strong>Balsa Cananéia</strong><br />
            Espera: 15 minutos
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
