'use client';

import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaPhone, FaDirections, FaExternalLinkAlt } from 'react-icons/fa';
import type { CommerceItem } from '@/lib/api';

type CommerceGridProps = {
  commerce: CommerceItem[];
  onGetDirections: (item: CommerceItem) => void;
};

const SECTORS = [
  { id: 'all', label: 'Todos', emoji: '📍', color: 'text-slate-300' },
  { id: 'alimentacao', label: 'Alimentação', emoji: '🍽️', color: 'text-orange-400' },
  { id: 'hospedagem', label: 'Hospedagem', emoji: '🏨', color: 'text-blue-400' },
  { id: 'comercio', label: 'Comércio', emoji: '🛒', color: 'text-emerald-400' },
  { id: 'servicos', label: 'Serviços', emoji: '🔧', color: 'text-yellow-400' },
  { id: 'lazer', label: 'Lazer', emoji: '🎯', color: 'text-cyan-400' },
];

const SECTOR_BG: Record<string, string> = {
  alimentacao: 'bg-orange-500/10 border-orange-500/30',
  hospedagem: 'bg-blue-500/10 border-blue-500/30',
  comercio: 'bg-emerald-500/10 border-emerald-500/30',
  servicos: 'bg-yellow-500/10 border-yellow-500/30',
  lazer: 'bg-cyan-500/10 border-cyan-500/30',
};

export function CommerceGrid({ commerce, onGetDirections }: CommerceGridProps) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = commerce.filter(c => {
    if (filter !== 'all' && c.sector !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.subsector.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = commerce.reduce((acc, c) => {
    acc[c.sector] = (acc[c.sector] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Comércios de Ilha Comprida">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FaMapMarkerAlt className="w-4 h-4 text-orange-400" aria-hidden="true" />
          Comércios — Ilha Comprida
          <span className="text-xs font-normal text-slate-500">({filtered.length})</span>
        </h3>
        <div className="relative">
          <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar comércio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar comércio por nome"
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent w-44"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4" role="radiogroup" aria-label="Filtrar por setor">
        {SECTORS.map(s => (
          <button
            key={s.id}
            role="radio"
            aria-checked={filter === s.id}
            onClick={() => setFilter(s.id)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
              filter === s.id
                ? 'bg-orange-500/20 text-orange-400 border-orange-400/50'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
            }`}
          >
            {s.emoji} {s.label}
            {s.id !== 'all' && counts[s.id] ? (
              <span className="ml-1 text-[10px] text-slate-500">({counts[s.id]})</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1" role="list">
        {filtered.map(item => {
          const bg = SECTOR_BG[item.sector] ?? 'bg-slate-800/40 border-slate-700/50';
          return (
            <div
              key={item.id}
              role="listitem"
              title={`${item.name} — ${item.subsector} — ${item.address}`}
              aria-label={`${item.name}, ${item.subsector}, ${item.address}`}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${bg}`}
            >
              <div className="mb-2">
                <h4 className="text-sm font-bold text-white">{item.name}</h4>
                <span className="text-[10px] text-slate-400">{item.subsector}</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 mb-3">
                <p className="flex items-start gap-1.5">
                  <FaMapMarkerAlt className="w-3 h-3 mt-0.5 text-slate-500 shrink-0" aria-hidden="true" />
                  <span>{item.address}</span>
                </p>
                {item.phone !== 'Não informado' && (
                  <p className="flex items-center gap-1.5">
                    <FaPhone className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true" />
                    <a href={`tel:${item.phone.replace(/\D/g, '')}`} className="hover:text-white transition-colors">{item.phone}</a>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onGetDirections(item)}
                  title={`Como chegar em ${item.name}`}
                  aria-label={`Como chegar em ${item.name}`}
                  className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/30 transition-colors"
                >
                  <FaDirections className="w-3 h-3" aria-hidden="true" />
                  Como Chegar
                </button>
                <a
                  href={item.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Abrir ${item.name} no Google Maps`}
                  aria-label={`Abrir ${item.name} no Google Maps`}
                  className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <FaExternalLinkAlt className="w-3 h-3" aria-hidden="true" />
                  Maps
                </a>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 col-span-full text-center py-4">Nenhum comércio encontrado.</p>
        )}
      </div>
    </section>
  );
}
