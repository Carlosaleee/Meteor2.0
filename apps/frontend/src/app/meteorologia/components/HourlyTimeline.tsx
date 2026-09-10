'use client';

import type { HourlyForecast } from '@/lib/api';
import { weatherEmoji, formatHour } from './weather-utils';

type HourlyTimelineProps = {
  data: HourlyForecast[];
  locationName?: string;
};

export function HourlyTimeline({ data, locationName }: HourlyTimelineProps) {
  if (!data?.length) return null;

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label={`Previsão horária — ${locationName ?? ''}`}>
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
        Próximas Horas{locationName ? ` — ${locationName}` : ''}
      </h3>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 12)}, minmax(0, 1fr))` }}
        role="list"
        aria-label="Previsão para as próximas 24 horas"
      >
        {data.slice(0, 24).map((hour, i) => (
          <div
            key={i}
            role="listitem"
            aria-label={`${formatHour(hour.time)}: ${Math.round(hour.temperature)} graus, ${hour.precipitationProbability}% de chance de chuva`}
            className="flex flex-col items-center gap-2 py-3 px-1 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-colors min-w-0"
          >
            <span className="text-xs text-slate-400 font-medium truncate w-full text-center">{formatHour(hour.time)}</span>
            <span className="text-xl" aria-hidden="true">{weatherEmoji(hour.weatherCode)}</span>
            <span className="text-sm font-bold text-white tabular-nums">{Math.round(hour.temperature)}°</span>
            <span className="text-[10px] text-cyan-400 tabular-nums">{hour.precipitationProbability}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
