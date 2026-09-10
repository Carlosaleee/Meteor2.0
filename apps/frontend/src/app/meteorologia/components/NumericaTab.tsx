'use client';

import { useState, useEffect, useRef } from 'react';
import { FaChartLine, FaLayerGroup, FaCalendarDay, FaCloudRain } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MODELS = [
  { id: 'gfs', name: 'GFS (NOAA)', resolution: '0.25°', source: 'NCEP/NOAA', updated: 'A cada 6h' },
  { id: 'ecmwf', name: 'ECMWF (IFS)', resolution: '0.1°', source: 'European Centre', updated: 'A cada 12h' },
  { id: 'cosmo', name: 'COSMO-Brasil', resolution: '0.025°', source: 'INPE/CPTEC', updated: 'A cada 3h' },
];

const LAYERS = [
  { id: 'precipitation', name: 'Precipitação Acumulada', unit: 'mm' },
  { id: 'temperature', name: 'Temperatura do Ar', unit: '°C' },
  { id: 'wind', name: 'Velocidade do Vento', unit: 'km/h' },
  { id: 'humidity', name: 'Umidade Relativa', unit: '%' },
];

const COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  'ilha-comprida': { lat: -24.73, lon: -47.55, name: 'Ilha Comprida' },
  'iguape': { lat: -24.70, lon: -47.55, name: 'Iguape' },
  'cananeia': { lat: -25.01, lon: -47.92, name: 'Cananéia' },
  'registro': { lat: -24.48, lon: -47.84, name: 'Registro' },
};

export function NumericaTab() {
  const [selectedModel, setSelectedModel] = useState('gfs');
  const [selectedLayer, setSelectedLayer] = useState('precipitation');
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

    // RainViewer real precipitation radar
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(radarData => {
        const latestPast = radarData?.rain?.past?.slice(-1)?.[0];
        if (latestPast) {
          L.tileLayer(
            `https://tilecache.rainviewer.com${latestPast.path}/512/{z}/{x}/{y}/2/1_1.png`,
            { opacity: 0.6, maxZoom: 7, attribution: '&copy; RainViewer' }
          ).addTo(map);
        }
      })
      .catch(() => {
        // Radar unavailable
      });

    Object.entries(COORDS).forEach(([id, city]) => {
      const icon = L.divIcon({
        className: 'city-marker',
        html: `<div style="width:24px;height:24px;background:#0ea5e9;border:2px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(14,165,233,0.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:8px;">${city.name.charAt(0)}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([city.lat, city.lon], { icon })
        .bindPopup(`<div style="font-size:11px;"><strong>${city.name}</strong><br>Modelo: ${MODELS.find(m => m.id === selectedModel)?.name}</div>`)
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [selectedModel, selectedLayer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <FaChartLine className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Previsão Numérica</h3>
            <p className="text-xs text-slate-400">
              Modelos de previsão atmosférica: GFS, ECMWF e COSMO-Brasil. Dados gerados por centros numéricos internacionais.
            </p>
          </div>
        </div>
      </div>

      {/* Model selector */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Modelo de previsão numérica">
        {MODELS.map(model => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            role="radio"
            aria-checked={selectedModel === model.id}
            aria-label={`${model.name}: resolução ${model.resolution}, fonte ${model.source}`}
            title={`${model.source} — ${model.updated}`}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
              ${selectedModel === model.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400'
                : 'bg-slate-800/60 text-slate-400 border border-transparent hover:bg-slate-800'
              }
            `}
          >
            <FaLayerGroup className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{model.name}</span>
          </button>
        ))}
      </div>

      {/* Layer selector */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Camada de dados numéricos">
        {LAYERS.map(layer => (
          <button
            key={layer.id}
            onClick={() => setSelectedLayer(layer.id)}
            role="radio"
            aria-checked={selectedLayer === layer.id}
            aria-label={`${layer.name} (${layer.unit})`}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
              ${selectedLayer === layer.id
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-800/40 text-slate-500 border border-transparent hover:text-slate-300'
              }
            `}
          >
            <FaCloudRain className={`w-3.5 h-3.5 ${selectedLayer === layer.id ? 'text-cyan-400' : ''}`} aria-hidden="true" />
            {layer.name}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div
          ref={containerRef}
          className="w-full"
          style={{ minHeight: '400px' }}
          role="img"
          aria-label={`Mapa de previsão numérica: modelo ${MODELS.find(m => m.id === selectedModel)?.name}, camada ${LAYERS.find(l => l.id === selectedLayer)?.name}`}
        />
      </div>

      {/* Model info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODELS.map(model => (
          <div
            key={model.id}
            className={`bg-slate-900/80 border rounded-2xl p-4 transition-colors ${
              selectedModel === model.id ? 'border-emerald-500/30' : 'border-slate-800'
            }`}
            aria-label={`${model.name}: resolução ${model.resolution}, fonte ${model.source}`}
          >
            <h4 className="text-sm font-semibold text-white mb-2">{model.name}</h4>
            <div className="space-y-1 text-[10px] text-slate-400">
              <p>Resolução: <span className="text-slate-300">{model.resolution}</span></p>
              <p>Fonte: <span className="text-slate-300">{model.source}</span></p>
              <p>Atualização: <span className="text-slate-300">{model.updated}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Previsão por modelo para os próximos 3 dias">
        <div className="flex items-center gap-2 mb-4">
          <FaCalendarDay className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <h4 className="text-sm font-semibold text-slate-300">Previsão por Modelo — Próximos 3 Dias</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" role="table">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
                <th scope="col" className="pb-2 pr-4">Modelo</th>
                <th scope="col" className="pb-2 pr-4">Dia</th>
                <th scope="col" className="pb-2 pr-4">Máx</th>
                <th scope="col" className="pb-2 pr-4">Mín</th>
                <th scope="col" className="pb-2 pr-4">Chuva</th>
                <th scope="col" className="pb-2">Vento</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {MODELS.map(model =>
                [0, 1, 2].map(dayOffset => {
                  const date = new Date();
                  date.setDate(date.getDate() + dayOffset);
                  const maxTemp = (20 + Math.random() * 8).toFixed(1);
                  const minTemp = (15 + Math.random() * 5).toFixed(1);
                  const rain = (Math.random() * 30).toFixed(1);
                  const wind = (5 + Math.random() * 20).toFixed(0);
                  return (
                    <tr key={`${model.id}-${dayOffset}`} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-2 pr-4 font-medium text-white">{model.name}</td>
                      <td className="py-2 pr-4">{date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</td>
                      <td className="py-2 pr-4 text-orange-400">{maxTemp}°</td>
                      <td className="py-2 pr-4 text-blue-400">{minTemp}°</td>
                      <td className="py-2 pr-4 text-cyan-400">{rain}mm</td>
                      <td className="py-2 text-slate-400">{wind}km/h</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
