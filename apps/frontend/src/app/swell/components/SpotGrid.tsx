'use client';

import { useState } from 'react';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaSearch, FaRoute } from 'react-icons/fa';
import type { Spot } from '@/lib/spots-data';
import { LEVEL_CONFIG } from '@/lib/spots-data';

type SpotGridProps = {
  spots: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot) => void;
};

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'beginner', label: '🌱 Iniciante' },
  { id: 'intermediate', label: '🏄 Intermediário' },
  { id: 'advanced', label: '🔥 Avançado' },
];

export function SpotGrid({ spots, selectedSpot, onSelectSpot }: SpotGridProps) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = spots.filter(s => {
    if (filter !== 'all' && s.level !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Picos de surf">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FaMapMarkerAlt className="w-4 h-4 text-blue-400" aria-hidden="true" />
          Picos de Surf — Ilha Comprida
        </h3>
        <div className="relative">
          <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar pico..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            title="Buscar pico por nome"
            aria-label="Buscar pico por nome"
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-40"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4" role="radiogroup" aria-label="Filtrar por dificuldade">
        {FILTERS.map(f => (
          <button
            key={f.id}
            role="radio"
            aria-checked={filter === f.id}
            title={`Filtrar picos: ${f.label}`}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              filter === f.id
                ? 'bg-blue-500/20 text-blue-400 border-blue-400/50'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
        {filtered.map(spot => {
          const cfg = LEVEL_CONFIG[spot.level] ?? LEVEL_CONFIG.beginner;
          const isSelected = selectedSpot?.id === spot.id;
          return (
            <div
              key={spot.id}
              role="listitem"
              title={`${spot.name} — Nível: ${cfg.label}, Melhor vento: ${spot.bestWind}, Exposição: ${spot.exposure}`}
              aria-label={`${spot.name}, nível ${cfg.label}, melhor vento ${spot.bestWind}`}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${cfg.bg} ${cfg.border} ${
                isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''
              }`}
              onClick={() => onSelectSpot(spot)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSpot(spot);
                }
              }}
              tabIndex={0}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{spot.name}</h4>
                  <span className={`text-[10px] font-medium ${cfg.color}`}>
                    {cfg.emoji} {cfg.label}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 line-clamp-2">{spot.description}</p>
              <div className="space-y-1 text-[11px] text-slate-400">
                <p><span className="text-slate-500">Vento:</span> {spot.bestWind}</p>
                <p><span className="text-slate-500">Exposição:</span> {spot.exposure}</p>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onSelectSpot(spot);
                  }}
                  title={`Ver rota até ${spot.name} no mapa`}
                  aria-label={`Ver rota até ${spot.name}`}
                  className="inline-flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <FaRoute className="w-3 h-3" aria-hidden="true" />
                  Como chegar
                </button>
                <a
                  href={spot.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Abrir ${spot.name} no Google Maps`}
                  aria-label={`Abrir ${spot.name} no Google Maps`}
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <FaExternalLinkAlt className="w-3 h-3" aria-hidden="true" />
                  Google Maps
                </a>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 col-span-full text-center py-4">Nenhum pico encontrado.</p>
        )}
      </div>
    </section>
  );
}
