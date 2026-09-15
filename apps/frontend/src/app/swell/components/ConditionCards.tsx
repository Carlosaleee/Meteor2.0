'use client';

import { FaWater, FaCompass, FaClock, FaStar, FaArrowUp } from 'react-icons/fa';

type ConditionCardsProps = {
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
  qualityLabel: string;
  qualityEmoji: string;
};

function waveDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

function qualityColor(label: string): string {
  if (label === 'Clássico!') return 'text-amber-400';
  if (label === 'Boas') return 'text-emerald-400';
  if (label === 'Pequenas') return 'text-blue-400';
  return 'text-slate-500';
}

export function ConditionCards({ waveHeight, wavePeriod, waveDirection, swellHeight, qualityLabel, qualityEmoji }: ConditionCardsProps) {
  const dir = waveDir(waveDirection);

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4" aria-label="Condições atuais do mar">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Condições Atuais</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <div
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-blue-500/30 transition-colors"
          title={`Altura da onda: ${waveHeight} metros`}
          aria-label={`Altura da onda: ${waveHeight} metros`}
        >
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <FaWater className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-white tabular-nums">{waveHeight}m</span>
          <span className="text-[9px] text-slate-400">Onda</span>
        </div>

        <div
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
          title={`Swell: ${swellHeight} metros`}
          aria-label={`Swell: ${swellHeight} metros`}
        >
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <FaArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-white tabular-nums">{swellHeight}m</span>
          <span className="text-[9px] text-slate-400">Swell</span>
        </div>

        <div
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/30 transition-colors"
          title={`Período: ${wavePeriod} segundos`}
          aria-label={`Período: ${wavePeriod} segundos`}
        >
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <FaClock className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-white tabular-nums">{wavePeriod}s</span>
          <span className="text-[9px] text-slate-400">Período</span>
        </div>

        <div
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-emerald-500/30 transition-colors"
          title={`Direção: ${waveDirection} graus ${dir}`}
          aria-label={`Direção: ${dir}`}
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <FaCompass className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-white">{dir}</span>
          <span className="text-[9px] text-slate-400">Direção</span>
        </div>

        <div
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-amber-500/30 transition-colors col-span-2 sm:col-span-1"
          title={`Qualidade: ${qualityLabel}`}
          aria-label={`Qualidade: ${qualityLabel}`}
        >
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <FaStar className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-lg" aria-hidden="true">{qualityEmoji}</span>
          <span className={`text-sm font-bold ${qualityColor(qualityLabel)}`}>{qualityLabel}</span>
        </div>
      </div>
    </section>
  );
}
