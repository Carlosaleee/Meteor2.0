'use client';

import { FaGlobeAmericas, FaVenus, FaMars } from 'react-icons/fa';
import type { WslRankingEntry } from '@/lib/api';

type WslRankingsProps = {
  men: WslRankingEntry[];
  women: WslRankingEntry[];
  loading: boolean;
};

function TrendIndicator({ trend }: { trend: number }) {
  if (trend === 0) return null;
  const up = trend > 0;
  return (
    <span className={`text-[9px] font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? '▲' : '▼'}
    </span>
  );
}

function CountryFlag({ country }: { country: string }) {
  const flags: Record<string, string> = {
    'Brazil': '🇧🇷',
    'Hawaii': '🇺🇸',
    'Australia': '🇦🇺',
    'United States': '🇺🇸',
    'Italy': '🇮🇹',
    'France': '🇫🇷',
    'Japan': '🇯🇵',
    'Portugal': '🇵🇹',
    'Spain': '🇪🇸',
    'South Africa': '🇿🇦',
  };
  return <span className="text-xs">{flags[country] ?? '🌍'}</span>;
}

function RankingTable({ entries, title, icon, accentColor }: {
  entries: WslRankingEntry[];
  title: string;
  icon: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex-1">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <ul className="space-y-3" role="list">
        {entries.map(entry => (
          <li
            key={entry.rank}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 transition-all"
          >
            <span className="text-[9px] font-bold text-slate-500 w-5 text-center">
              {entry.rank}º
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">{entry.name}</span>
                <TrendIndicator trend={entry.trend} />
              </div>
              <div className="flex items-center gap-2">
                <CountryFlag country={entry.country} />
                <span className="text-[10px] text-slate-500">{entry.country}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold ${accentColor}`}>{entry.points.toLocaleString('pt-BR')}</span>
              <span className="block text-[9px] text-slate-500">pontos</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WslRankings({ men, women, loading }: WslRankingsProps) {
  if (loading) {
    return (
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
        <div className="h-4 bg-slate-800 rounded w-44 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Rankings WSL">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
        <FaGlobeAmericas className="w-4 h-4 text-blue-400" aria-hidden="true" />
        Rankings WSL
      </h3>
      <div className="flex gap-4">
        <RankingTable
          entries={men}
          title="Masculino"
          icon={<FaMars className="w-4 h-4 text-blue-400" aria-hidden="true" />}
          accentColor="text-blue-400"
        />
        <RankingTable
          entries={women}
          title="Feminino"
          icon={<FaVenus className="w-4 h-4 text-pink-400" aria-hidden="true" />}
          accentColor="text-pink-400"
        />
      </div>
    </section>
  );
}
