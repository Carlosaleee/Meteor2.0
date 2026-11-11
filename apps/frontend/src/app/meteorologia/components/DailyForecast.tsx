import { meteorologia } from '@/i18n/dictionaries/meteorologia';
import { useDict } from '@/i18n/context';
import type { DailyForecast } from '@/lib/api';
import { weatherEmoji, weatherDescription, formatDay } from './weather-utils';
import { FaTint, FaWind, FaSun, FaRegSun } from 'react-icons/fa';

type DailyForecastProps = {
  data: DailyForecast[];
};

export function DailyForecastTable({ data }: DailyForecastProps) {
  const t = useDict(meteorologia);
  if (!data?.length) return null;

  return (
    <section className="bg-card/80 border border-card-border rounded-2xl p-5" aria-label={t['daily.aria']}>
      <h3 className="text-sm font-semibold text-card-subtle mb-4 uppercase tracking-wider">{t['daily.title']}</h3>
      <div className="space-y-2" role="list" aria-label={t['daily.listAria']}>
        {data.map((day, i) => (
          <div
            key={i}
            role="listitem"
            title={`${formatDay(day.date)} ${day.date.slice(5, 10)}: ${weatherDescription(day.weatherCode)}, máxima ${Math.round(day.tempMax)}°C, mínima ${Math.round(day.tempMin)}°C, ${Math.round(day.precipitationProbabilityMax)}% de chuva, vento até ${Math.round(day.windSpeedMax)}km/h`}
            aria-label={`${formatDay(day.date)} ${day.date.slice(5, 10)}: ${weatherDescription(day.weatherCode)}, máxima ${Math.round(day.tempMax)} graus, mínima ${Math.round(day.tempMin)} graus, ${Math.round(day.precipitationProbabilityMax)}% de chuva`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card-2/40 hover:bg-card-2/80 transition-colors border border-transparent hover:border-card-line/50"
          >
            {/* Day + Weather */}
            <div className="flex items-center gap-3 w-36">
              <span className="text-xl" aria-hidden="true">{weatherEmoji(day.weatherCode)}</span>
              <div>
                <span className="text-sm font-semibold text-card-text">{formatDay(day.date)}</span>
                <span className="text-[10px] text-card-dim block">{day.date.slice(5, 10)}</span>
              </div>
            </div>

            {/* Description */}
            <span className="text-xs text-card-muted w-32 hidden md:block">
              {weatherDescription(day.weatherCode)}
            </span>

            {/* Temps */}
            <div className="flex items-center gap-1.5 w-24">
              <span className="text-sm font-bold text-card-text tabular-nums">{Math.round(day.tempMax)}°</span>
              <span className="text-xs text-card-dim">/</span>
              <span className="text-sm text-card-muted tabular-nums">{Math.round(day.tempMin)}°</span>
            </div>

            {/* Precipitation */}
            <div className="flex items-center gap-1 w-20">
              <FaTint className="w-3 h-3 text-cyan-400" aria-hidden="true" />
              <span className="text-xs text-card-subtle tabular-nums">{Math.round(day.precipitationProbabilityMax)}%</span>
              <span className="text-[10px] text-card-faint hidden sm:inline">({day.precipitationSum}mm)</span>
            </div>

            {/* Wind */}
            <div className="flex items-center gap-1 w-16">
              <FaWind className="w-3 h-3 text-card-dim" aria-hidden="true" />
              <span className="text-xs text-card-subtle tabular-nums">{Math.round(day.windSpeedMax)}km/h</span>
            </div>

            {/* Sunrise/Sunset */}
            <div className="flex items-center gap-1 w-20 hidden lg:flex">
              <FaSun className="w-3 h-3 text-amber-400" aria-hidden="true" />
              <span className="text-[10px] text-card-muted">{day.sunrise?.slice(11, 16)}</span>
              <FaRegSun className="w-3 h-3 text-orange-400 ml-1" aria-hidden="true" />
              <span className="text-[10px] text-card-muted">{day.sunset?.slice(11, 16)}</span>
            </div>

            {/* UV */}
            <div className="hidden lg:flex items-center gap-1">
              <span className="text-[10px] text-card-dim">UV</span>
              <span className={`text-xs font-semibold ${day.uvIndexMax > 7 ? 'text-red-400' : day.uvIndexMax > 4 ? 'text-amber-400' : 'text-green-400'}`}>
                {day.uvIndexMax}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
