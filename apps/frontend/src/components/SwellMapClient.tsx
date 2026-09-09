'client';







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
