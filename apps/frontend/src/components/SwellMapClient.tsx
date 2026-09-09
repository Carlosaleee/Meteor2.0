'client';

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
