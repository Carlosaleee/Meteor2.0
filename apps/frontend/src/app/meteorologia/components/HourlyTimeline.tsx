'use client';

import { meteorologia } from '@/i18n/dictionaries/meteorologia';
import { useDict } from '@/i18n/context';
import type { HourlyForecast } from '@/lib/api';
import { weatherEmoji, formatHour, weatherDescription } from './weather-utils';

type HourlyTimelineProps = {
  data: HourlyForecast[];
  locationName?: string;
};

export function HourlyTimeline({ data, locationName }: HourlyTimelineProps) {
  const t = useDict(meteorologia);
  if (!data?.length) return null;

  return (
    <section className="bg-card/80 border border-card-border rounded-2xl p-5" aria-label={`Previsão horária — ${locationName ?? ''}`}>
      <h3 className="text-sm font-semibold text-card-subtle mb-4 uppercase tracking-wider">
        Próximas Horas{locationName ? ` — ${locationName}` : ''}
      </h3>
      <div
        className="grid gap-2 sm:gap-3 overflow-x-auto"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))' }}
        role="list"
        aria-label={t['hour.listAria']}
      >
        {data.slice(0, 24).map((hour, i) => (
          <div
            key={i}
            role="listitem"
            title={`${formatHour(hour.time)}: ${weatherDescription(hour.weatherCode)}, ${Math.round(hour.temperature)}°C, ${hour.precipitationProbability}% de chuva, vento ${Math.round(hour.windSpeed)}km/h`}
            aria-label={`${formatHour(hour.time)}: ${Math.round(hour.temperature)} graus, ${hour.precipitationProbability}% de chance de chuva`}
            className="flex flex-col items-center gap-1.5 sm:gap-2 py-3 px-1 rounded-xl bg-card-2/60 border border-card-line/50 hover:border-card-line transition-colors min-w-0"
          >
            <span className="text-[10px] sm:text-xs text-card-muted font-medium truncate w-full text-center">{formatHour(hour.time)}</span>
            <span className="text-lg sm:text-xl" aria-hidden="true">{weatherEmoji(hour.weatherCode)}</span>
            <span className="text-xs sm:text-sm font-bold text-card-text tabular-nums">{Math.round(hour.temperature)}°</span>
            <span className="text-[9px] sm:text-[10px] text-cyan-400 tabular-nums">{hour.precipitationProbability}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
