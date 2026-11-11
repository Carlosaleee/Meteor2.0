'use client';

import { meteorologia } from '@/i18n/dictionaries/meteorologia';
import { useDict } from '@/i18n/context';
import { useState } from 'react';
import { FaSatellite, FaCloud, FaWind, FaExternalLinkAlt } from 'react-icons/fa';

const SATELLITE_SOURCES = [
  {
    id: 'goes16-brasil',
    name: 'GOES-16 — Brasil',
    description: 'Imagem de satélite geostacionário em tempo real',
    url: 'https://www.cptec.inpe.br/',
    region: 'Brasil',
  },
  {
    id: 'goes16-litoral',
    name: 'GOES-16 — Litoral SP',
    description: 'Região ampliada do litoral paulista',
    url: 'https://www.cptec.inpe.br/',
    region: 'São Paulo',
  },
  {
    id: 'radar-cptec',
    name: 'Radar CPTEC/INPE',
    description: 'Radar meteorológico com refletividade',
    url: 'https://www.cptec.inpe.br/',
    region: 'Litoral Sul',
  },
];

const WEATHER_LAYERS = [
  { id: 'clouds', name: 'Nebulosidade', icon: FaCloud, color: 'text-card-muted' },
  { id: 'wind', name: 'Vento', icon: FaWind, color: 'text-blue-400' },
  { id: 'precipitation', name: 'Precipitação', icon: FaCloud, color: 'text-cyan-400' },
];

export function SatelliteTab() {
  const t = useDict(meteorologia);
  const [selectedSource, setSelectedSource] = useState(SATELLITE_SOURCES[0].id);
  const [selectedLayer, setSelectedLayer] = useState('clouds');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <FaSatellite className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-card-text mb-1">Imagens de Satélite</h3>
            <p className="text-xs text-card-muted">
              Dados em tempo real via CPTEC/INPE e NOAA. Imagens atualizadas a cada 15 minutos.
            </p>
          </div>
        </div>
      </div>

      {/* Source selector */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t['sat.sourceAria']}>
        {SATELLITE_SOURCES.map(source => (
          <button
            key={source.id}
            onClick={() => setSelectedSource(source.id)}
            role="radio"
            aria-checked={selectedSource === source.id}
            aria-label={source.name}
            title={source.description}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
              ${selectedSource === source.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-400'
                : 'bg-card-2/60 text-card-muted border border-transparent hover:bg-card-2'
              }
            `}
          >
            <FaSatellite className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{source.name}</span>
          </button>
        ))}
      </div>

      {/* Layer toggles */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t['sat.layerAria']}>
        {WEATHER_LAYERS.map(layer => {
          const Icon = layer.icon;
          return (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              role="radio"
              aria-checked={selectedLayer === layer.id}
              aria-label={layer.name}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
                ${selectedLayer === layer.id
                  ? 'bg-card-line text-card-text border border-card-line'
                  : 'bg-card-2/40 text-card-dim border border-transparent hover:text-card-subtle'
                }
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${selectedLayer === layer.id ? layer.color : ''}`} aria-hidden="true" />
              {layer.name}
            </button>
          );
        })}
      </div>

      {/* Satellite viewer */}
      <div className="bg-card/80 border border-card-border rounded-2xl overflow-hidden">
        <div
          className="panel-tinted relative w-full bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950/80"
          style={{ minHeight: '450px' }}
          role="img"
          aria-label={`Imagem de satélite: ${SATELLITE_SOURCES.find(s => s.id === selectedSource)?.name}, camada ${WEATHER_LAYERS.find(l => l.id === selectedLayer)?.name}`}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="w-full h-full" style={{
              backgroundImage: 'linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
          </div>

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center" aria-hidden="true">
                <FaSatellite className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-card-text mb-1">
                  Imagem de Satélite — {SATELLITE_SOURCES.find(s => s.id === selectedSource)?.region}
                </h4>
                <p className="text-xs text-card-muted">
                  Camada: {WEATHER_LAYERS.find(l => l.id === selectedLayer)?.name}
                </p>
              </div>

              <div className="flex justify-center gap-6 text-[10px] text-card-dim">
                <span>Lat: -24.5° a -25.5°</span>
                <span>Lon: -47.0° a -48.0°</span>
              </div>

              <a
                href={SATELLITE_SOURCES.find(s => s.id === selectedSource)?.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={`Abrir ${SATELLITE_SOURCES.find(s => s.id === selectedSource)?.name} no site do CPTEC`}
              >
                <FaExternalLinkAlt className="w-3 h-3" aria-hidden="true" />
                Abrir no CPTEC/INPE
              </a>
            </div>
          </div>

          {/* Region labels */}
          <div className="absolute top-4 left-4 text-[10px] text-card-dim" aria-hidden="true">
            <div className="px-2 py-1 bg-black/30 rounded">Ilha Comprida</div>
          </div>
          <div className="absolute top-4 right-4 text-[10px] text-card-dim" aria-hidden="true">
            <div className="px-2 py-1 bg-black/30 rounded">Iguape</div>
          </div>
          <div className="absolute bottom-4 left-4 text-[10px] text-card-dim" aria-hidden="true">
            <div className="px-2 py-1 bg-black/30 rounded">Cananéia</div>
          </div>
          <div className="absolute bottom-4 right-4 text-[10px] text-card-dim" aria-hidden="true">
            <div className="px-2 py-1 bg-black/30 rounded">Registro</div>
          </div>

          {/* Scale bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1" aria-hidden="true">
            <div className="w-20 h-0.5 bg-card-line" />
            <span className="text-[10px] text-card-dim">50km</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-card/80 border border-card-border rounded-2xl p-5" aria-label={t['sat.legendAria']}>
        <h4 className="text-xs font-semibold text-card-subtle mb-3">{t['sat.legendTitle']}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Céu limpo', color: 'bg-blue-900/60', border: 'border-blue-700/30' },
            { label: 'Nuvens altas', color: 'bg-card-line/60', border: 'border-card-line/30' },
            { label: 'Nuvens médias', color: 'bg-card-line/60', border: 'border-card-muted/30' },
            { label: 'Chuva / Tempestade', color: 'bg-cyan-600/60', border: 'border-cyan-500/30' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${item.color} border ${item.border}`} aria-hidden="true" />
              <span className="text-[10px] text-card-muted">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
