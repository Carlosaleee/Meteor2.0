'use client';

import { FaMapMarkerAlt } from 'react-icons/fa';

const LOCATIONS = [
  { id: 'ilha-comprida', name: 'Ilha Comprida', region: 'Litoral Sul' },
  { id: 'iguape', name: 'Iguape', region: 'Vale do Ribeira' },
  { id: 'cananeia', name: 'Cananéia', region: 'Litoral Sul' },
  { id: 'registro', name: 'Registro', region: 'Vale do Ribeira' },
];

type LocationSelectorProps = {
  active: string;
  onSelect: (id: string) => void;
};

export function LocationSelector({ active, onSelect }: LocationSelectorProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="radiogroup" aria-label="Selecionar cidade">
      {LOCATIONS.map(loc => {
        const isActive = active === loc.id;
        return (
          <button
            key={loc.id}
            onClick={() => onSelect(loc.id)}
            role="radio"
            aria-checked={isActive}
            aria-label={`${loc.name}, ${loc.region}`}
            title={`${loc.name} — ${loc.region}`}
            className={`
              flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
              ${isActive
                ? 'bg-amber-500/20 text-amber-400 border border-amber-400 shadow-lg shadow-amber-500/10'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600'
              }
            `}
          >
            <FaMapMarkerAlt className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} aria-hidden="true" />
            <span className="truncate">{loc.name}</span>
            <span className={`text-xs truncate hidden sm:inline ${isActive ? 'text-amber-500/60' : 'text-slate-600'}`}>{loc.region}</span>
          </button>
        );
      })}
    </div>
  );
}
