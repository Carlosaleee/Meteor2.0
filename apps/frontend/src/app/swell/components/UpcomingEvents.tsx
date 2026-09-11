'use client';

import { FaCalendarAlt, FaGlobeAmericas } from 'react-icons/fa';
import type { WslEvent } from '@/lib/api';

type UpcomingEventsProps = {
  events: WslEvent[];
  loading: boolean;
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Standby: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${colors[status] ?? colors.Upcoming}`}>
      {status}
    </span>
  );
}

export function UpcomingEvents({ events, loading }: UpcomingEventsProps) {
  if (loading) {
    return (
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
        <div className="h-4 bg-slate-800 rounded w-44 mb-4" />
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Próximos eventos WSL">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
        <FaCalendarAlt className="w-4 h-4 text-blue-400" aria-hidden="true" />
        Próximos Eventos WSL
      </h3>
      <div className="grid sm:grid-cols-2 gap-3" role="list">
        {events.map((event, i) => (
          <div
            key={i}
            role="listitem"
            className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-white truncate">{event.name}</h4>
                <StatusBadge status={event.status} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <FaGlobeAmericas className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true" />
                <span className="text-[11px] text-slate-400 truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true" />
                <span className="text-[11px] text-slate-400">{event.dates}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
