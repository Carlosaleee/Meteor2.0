'use client';

import { FaMapMarkerAlt } from 'react-icons/fa';

const LOCATIONS = [
  { id: 'ilha-comprida', name: 'Ilha Comprida', region: 'Litoral Sul', tip: 'Clique para ver previsão de Ilha Comprida — praia e litoral' },
  { id: 'iguape', name: 'Iguape', region: 'Vale do Ribeira', tip: 'Clique para ver previsão de Iguape — rio e estuário' },
  { id: 'cananeia', name: 'Cananéia', region: 'Litoral Sul', tip: 'Clique para ver previsão de Cananéia — baía e ilha do Cardoso' },
  { id: 'registro', name: 'Registro', region: 'Vale do Ribeira', tip: 'Clique para ver previsão de Registro — interior paulista' },
];

type LocationSelectorProps = {
  active: string;
  onSelect: (id: string) => void;
};

export function LocationSelector({ active, onSelect }: LocationSelectorProps) {
  return (
    <div role="group" aria-label="Selecionar cidade para ver previsão do tempo">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-medium">Selecione a cidade</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2" role="radiogroup" aria-label="Cidades disponíveis">
        {LOCATIONS.map(loc => {
          const isActive = active === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => onSelect(loc.id)}
              role="radio"
              aria-checked={isActive}
              aria-label={`${loc.name}, ${loc.region}${isActive ? ' (selecionada)' : ''}`}
              title={loc.tip}
              className={`
                flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                ${isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-400 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600'
                }
              `}
            >
              <FaMapMarkerAlt className={`w-3 h-3 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} aria-hidden="true" />
              <span className="truncate">{loc.name}</span>
              <span className={`text-[10px] truncate hidden sm:inline ${isActive ? 'text-amber-500/60' : 'text-slate-600'}`}>{loc.region}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
