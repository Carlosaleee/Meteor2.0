'use client';

import { swell } from '@/i18n/dictionaries/swell';
import { useDict } from '@/i18n/context';
import type { HourlyMarinePoint } from '@/lib/api';

type HourlySwellProps = {
  data: HourlyMarinePoint[];
};

function waveEmoji(height: number): string {
  if (height < 0.5) return '🌊';
  if (height < 1.0) return '🏄';
  if (height < 1.5) return '🏄‍♂️';
  return '🏆';
}

function waveDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

function qualityLabel(height: number): { text: string; color: string } {
  if (height >= 1.5) return { text: 'Clássico', color: 'text-amber-400' };
  if (height >= 1.0) return { text: 'Boas', color: 'text-emerald-400' };
  if (height >= 0.5) return { text: 'Pequenas', color: 'text-blue-400' };
  return { text: 'Flat', color: 'text-card-dim' };
}

export function HourlySwell({ data }: HourlySwellProps) {
  const t = useDict(swell);
  return (
    <section className="bg-card/80 border border-card-border rounded-2xl p-5" aria-label={t['hourly.sectionAria']}>
      <h3 className="text-sm font-semibold text-card-subtle mb-4 uppercase tracking-wider">{t['hourly.heading']}</h3>
      <div
        className="grid gap-2 sm:gap-3 overflow-x-auto"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))' }}
        role="list"
        aria-label={t['hourly.listAria']}
      >
        {data.map((point, i) => {
          const h = new Date(point.time).getHours();
          const label = `${String(h).padStart(2, '0')}:00`;
          const emoji = waveEmoji(point.waveHeight);
          const dir = waveDir(point.waveDirection);
          const q = qualityLabel(point.waveHeight);

          return (
            <div
              key={i}
              role="listitem"
              title={`${label}: Onda ${point.waveHeight}m (${q.text}), período ${point.wavePeriod}s, ${dir}. Swell ${point.swellHeight}m`}
              aria-label={`${label}: onda ${point.waveHeight} metros, ${q.text}, período ${point.wavePeriod} segundos, direção ${dir}`}
              className="flex flex-col items-center gap-1.5 sm:gap-2 py-3 px-1 rounded-xl bg-card-2/60 border border-card-line/50 hover:border-card-line transition-colors min-w-0"
            >
              <span className="text-[10px] sm:text-xs text-card-muted font-medium truncate w-full text-center">{label}</span>
              <span className="text-lg sm:text-xl" aria-hidden="true">{emoji}</span>
              <span className="text-xs sm:text-sm font-bold text-card-text tabular-nums">{point.waveHeight}m</span>
              <span className={`text-[9px] sm:text-[10px] font-medium ${q.color}`}>{q.text}</span>
              <span className="text-[9px] text-card-dim">{point.wavePeriod}s · {dir}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
