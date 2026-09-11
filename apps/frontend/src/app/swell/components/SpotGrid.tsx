'use client';

import { useState } from 'react';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaSearch } from 'react-icons/fa';

type Spot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  level: string;
  bestWind: string;
  exposure: string;
  howToGetThere: string;
};

type SpotGridProps = {
  spots: Spot[];
};

const LEVEL_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  beginner: { label: 'Iniciante', emoji: '🌱', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  intermediate: { label: 'Intermediário', emoji: '🏄', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  advanced: { label: 'Avançado', emoji: '🔥', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'beginner', label: '🌱 Iniciante' },
  { id: 'intermediate', label: '🏄 Intermediário' },
  { id: 'advanced', label: '🔥 Avançado' },
];

export function SpotGrid({ spots }: SpotGridProps) {
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
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
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
          return (
            <div
              key={spot.id}
              role="listitem"
              title={`${spot.name} — Nível: ${cfg.label}, Melhor vento: ${spot.bestWind}, Exposição: ${spot.exposure}`}
              aria-label={`${spot.name}, nível ${cfg.label}, melhor vento ${spot.bestWind}`}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${cfg.bg}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{spot.name}</h4>
                  <span className={`text-[10px] font-medium ${cfg.color}`}>
                    {cfg.emoji} {cfg.label}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-[11px] text-slate-400">
                <p><span className="text-slate-500">Vento:</span> {spot.bestWind}</p>
                <p><span className="text-slate-500">Exposição:</span> {spot.exposure}</p>
              </div>
              <a
                href={spot.howToGetThere}
                target="_blank"
                rel="noopener noreferrer"
                title={`Como chegar ao ${spot.name} — abrir no Google Maps`}
                aria-label={`Como chegar ao ${spot.name}`}
                className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FaExternalLinkAlt className="w-3 h-3" aria-hidden="true" />
                Como chegar
              </a>
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
