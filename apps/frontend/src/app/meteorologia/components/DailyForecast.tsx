import type { DailyForecast } from '@/lib/api';
import { weatherEmoji, weatherDescription, formatDay } from './weather-utils';
import { FaTint, FaWind, FaSun, FaRegSun } from 'react-icons/fa';

type DailyForecastProps = {
  data: DailyForecast[];
};

export function DailyForecastTable({ data }: DailyForecastProps) {
  if (!data?.length) return null;

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Previsão estendida para 7 dias">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Previsão Estendida — 7 Dias</h3>
      <div className="space-y-2" role="list" aria-label="Previsão diária">
        {data.map((day, i) => (
          <div
            key={i}
            role="listitem"
            aria-label={`${formatDay(day.date)} ${day.date.slice(5, 10)}: ${weatherDescription(day.weatherCode)}, máxima ${Math.round(day.tempMax)} graus, mínima ${Math.round(day.tempMin)} graus, ${Math.round(day.precipitationProbabilityMax)}% de chuva`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700/50"
          >
            {/* Day + Weather */}
            <div className="flex items-center gap-3 w-36">
              <span className="text-xl" aria-hidden="true">{weatherEmoji(day.weatherCode)}</span>
              <div>
                <span className="text-sm font-semibold text-white">{formatDay(day.date)}</span>
                <span className="text-[10px] text-slate-500 block">{day.date.slice(5, 10)}</span>
              </div>
            </div>

            {/* Description */}
            <span className="text-xs text-slate-400 w-32 hidden md:block">
              {weatherDescription(day.weatherCode)}
            </span>

            {/* Temps */}
            <div className="flex items-center gap-1.5 w-24">
              <span className="text-sm font-bold text-white tabular-nums">{Math.round(day.tempMax)}°</span>
              <span className="text-xs text-slate-500">/</span>
              <span className="text-sm text-slate-400 tabular-nums">{Math.round(day.tempMin)}°</span>
            </div>

            {/* Precipitation */}
            <div className="flex items-center gap-1 w-20">
              <FaTint className="w-3 h-3 text-cyan-400" aria-hidden="true" />
              <span className="text-xs text-slate-300 tabular-nums">{Math.round(day.precipitationProbabilityMax)}%</span>
              <span className="text-[10px] text-slate-600 hidden sm:inline">({day.precipitationSum}mm)</span>
            </div>

            {/* Wind */}
            <div className="flex items-center gap-1 w-16">
              <FaWind className="w-3 h-3 text-slate-500" aria-hidden="true" />
              <span className="text-xs text-slate-300 tabular-nums">{Math.round(day.windSpeedMax)}km/h</span>
            </div>

            {/* Sunrise/Sunset */}
            <div className="flex items-center gap-1 w-20 hidden lg:flex">
              <FaSun className="w-3 h-3 text-amber-400" aria-hidden="true" />
              <span className="text-[10px] text-slate-400">{day.sunrise?.slice(11, 16)}</span>
              <FaRegSun className="w-3 h-3 text-orange-400 ml-1" aria-hidden="true" />
              <span className="text-[10px] text-slate-400">{day.sunset?.slice(11, 16)}</span>
            </div>

            {/* UV */}
            <div className="hidden lg:flex items-center gap-1">
              <span className="text-[10px] text-slate-500">UV</span>
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
