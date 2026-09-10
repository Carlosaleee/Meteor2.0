'use client';

import dynamic from 'next/dynamic';
import type { MeteorologyResponse } from '@/lib/api';
import { MetricCard } from './MetricCard';
import { HourlyTimeline } from './HourlyTimeline';
import { DailyForecastTable } from './DailyForecast';
import { CityGrid } from './CityGrid';
import { SkeletonCard, SkeletonTimeline, SkeletonTable, SkeletonMap } from './Skeletons';
import { weatherDescription, windDirection } from './weather-utils';
import { FaTemperatureHigh, FaTint, FaWind, FaCompass, FaWater, FaEye, FaCloud, FaSun } from 'react-icons/fa';

const WeatherMapDetail = dynamic(
  () => import('./WeatherMapDetail').then(mod => ({ default: mod.WeatherMapDetail })),
  { ssr: false },
);

type PrevisaoTabProps = {
  data: MeteorologyResponse | null;
  loading: boolean;
  onSelectLocation: (id: string) => void;
};

export function PrevisaoTab({ data, loading, onSelectLocation }: PrevisaoTabProps) {
  if (loading || !data) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando dados meteorológicos">
        <SkeletonMap />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonTimeline />
        <SkeletonTable />
      </div>
    );
  }

  const c = data.current;

  return (
    <div className="space-y-6">
      {/* 1. MAPA — primeira seção */}
      <section aria-label={`Mapa meteorológico — ${data.location}`}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <WeatherMapDetail data={data} />
        </div>
      </section>

      {/* 2. Weather description banner */}
      <div
        className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl px-5 py-3"
        aria-live="polite"
      >
        <p className="text-sm text-cyan-300">
          <FaSun className="inline w-4 h-4 mr-1.5" aria-hidden="true" />
          {weatherDescription(c.weatherCode)} em <strong className="text-white">{data.location}</strong>
        </p>
      </div>

      {/* 4. Metric Cards — 8 cards */}
      <section aria-label="Métricas atuais">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={FaTemperatureHigh}
            label="Temperatura"
            value={Math.round(c.temperature)}
            unit="°C"
            subLabel={`Sensação: ${Math.round(c.apparentTemperature)}°C`}
            color="text-orange-400"
            ariaLabel={`Temperatura: ${Math.round(c.temperature)} graus Celsius, sensação de ${Math.round(c.apparentTemperature)} graus`}
          />
          <MetricCard
            icon={FaTint}
            label="Umidade"
            value={c.humidity}
            unit="%"
            subLabel="Relativa do ar"
            color="text-cyan-400"
            ariaLabel={`Umidade relativa: ${c.humidity} por cento`}
          />
          <MetricCard
            icon={FaWind}
            label="Vento"
            value={Math.round(c.windSpeed)}
            unit="km/h"
            subLabel={`${windDirection(c.windDirection)} · ${c.windDirection}°`}
            color="text-blue-400"
            ariaLabel={`Vento: ${Math.round(c.windSpeed)} quilômetros por hora, direção ${windDirection(c.windDirection)}`}
          />
          <MetricCard
            icon={FaWater}
            label="Chuva"
            value={c.precipitation}
            unit="mm"
            subLabel="Precipitação atual"
            color="text-teal-400"
            ariaLabel={`Precipitação: ${c.precipitation} milímetros`}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <MetricCard
            icon={FaCompass}
            label="Pressão"
            value={Math.round(c.pressure)}
            unit="hPa"
            color="text-slate-400"
            ariaLabel={`Pressão atmosférica: ${Math.round(c.pressure)} hectopascais`}
          />
          <MetricCard
            icon={FaCloud}
            label="Nuvens"
            value={data.hourly?.[0]?.cloudCover ?? '--'}
            unit="%"
            color="text-slate-400"
            ariaLabel={`Cobertura de nuvens: ${data.hourly?.[0]?.cloudCover ?? 'indisponível'} por cento`}
          />
          <MetricCard
            icon={FaEye}
            label="Visibilidade"
            value={data.hourly?.[0]?.visibility ? `${(data.hourly[0].visibility / 1000).toFixed(0)}` : '--'}
            unit="km"
            color="text-slate-400"
            ariaLabel={`Visibilidade: ${data.hourly?.[0]?.visibility ? `${(data.hourly[0].visibility / 1000).toFixed(0)} quilômetros` : 'indisponível'}`}
          />
          <MetricCard
            icon={FaSun}
            label="Índice UV"
            value={data.daily?.[0]?.uvIndexMax?.toFixed(1) ?? '--'}
            unit=""
            subLabel={data.daily?.[0]?.uvIndexMax > 7 ? 'Muito alto' : data.daily?.[0]?.uvIndexMax > 4 ? 'Moderado' : 'Baixo'}
            color={data.daily?.[0]?.uvIndexMax > 7 ? 'text-red-400' : data.daily?.[0]?.uvIndexMax > 4 ? 'text-amber-400' : 'text-green-400'}
            ariaLabel={`Índice UV: ${data.daily?.[0]?.uvIndexMax ?? 'indisponível'}`}
          />
        </div>
      </section>

      {/* 5. Hourly Timeline — com nome da cidade */}
      {data.hourly?.length > 0 && (
        <HourlyTimeline data={data.hourly} locationName={data.location} />
      )}

      {/* 6. Daily Forecast */}
      {data.daily?.length > 0 && <DailyForecastTable data={data.daily} />}

      {/* 7. Notícias Meteorológicas — final */}
      <CityGrid onSelectLocation={onSelectLocation} />
    </div>
  );
}
