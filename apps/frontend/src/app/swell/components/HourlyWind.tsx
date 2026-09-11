'use client';

import type { HourlyMarinePoint } from '@/lib/api';
import { windQuality, windDir, beaufortScale } from './windUtils';

type HourlyWindProps = {
  data: HourlyMarinePoint[];
};

function windEmoji(speed: number): string {
  if (speed < 6) return '🍃';
  if (speed < 12) return '🌬️';
  if (speed < 20) return '💨';
  if (speed < 30) return '🌪️';
  return '⚠️';
}

function gustWarning(speed: number, gust: number): boolean {
  return gust > speed * 1.3;
}

export function HourlyWind({ data }: HourlyWindProps) {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Previsão horária de ventos">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Próximas Horas — Ventos</h3>
      <div
        className="grid gap-2 sm:gap-3 overflow-x-auto"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}
        role="list"
        aria-label="Previsão de ventos para as próximas horas"
      >
        {data.map((point, i) => {
          const h = new Date(point.time).getHours();
          const label = `${String(h).padStart(2, '0')}:00`;
          const emoji = windEmoji(point.windSpeed);
          const dir = windDir(point.windDirection);
          const q = windQuality(point.windSpeed);
          const beaufort = beaufortScale(point.windSpeed);
          const hasGust = gustWarning(point.windSpeed, point.windGust);

          return (
            <div
              key={i}
              role="listitem"
              title={`${label}: ${point.windSpeed} km/h (${q.label}), rajada ${point.windGust} km/h, ${dir}, Beaufort ${beaufort}`}
              aria-label={`${label}: vento ${point.windSpeed} km/h, ${q.label}, rajada ${point.windGust} km/h, direção ${dir}`}
              className={`flex flex-col items-center gap-1.5 sm:gap-2 py-3 px-1 rounded-xl border transition-colors min-w-0 ${
                hasGust
                  ? 'bg-amber-900/20 border-amber-700/40 hover:border-amber-600/60'
                  : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate w-full text-center">{label}</span>
              <span className="text-lg sm:text-xl" aria-hidden="true">{emoji}</span>
              <span className="text-xs sm:text-sm font-bold text-white tabular-nums">{point.windSpeed}<span className="text-[10px] font-normal text-slate-400"> km/h</span></span>
              <span className={`text-[9px] sm:text-[10px] font-medium ${q.textClass}`}>{q.label}</span>
              <span className="text-[9px] text-slate-500">{dir} · B{beaufort}</span>
              {hasGust && (
                <span className="text-[9px] text-amber-400 font-medium">Rajada {point.windGust}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
