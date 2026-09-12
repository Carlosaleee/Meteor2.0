'use client';

import { FaWater, FaWind, FaMapMarkerAlt, FaNewspaper } from 'react-icons/fa';
import type { OceanographyResponse, HourlyMarinePoint, AiSummaryResponse, NewsResponse } from '@/lib/api';
import { SPOTS, LEVEL_CONFIG } from '@/lib/spots-data';
import { ResumoIA } from './ResumoIA';
import { ConditionCards } from './ConditionCards';
import { WindConditionCards } from './WindConditionCards';
import { HourlySwell } from './HourlySwell';
import { SurfNews } from './SurfNews';
import { DailyTip } from './DailyTip';
import { ForecastSection } from './ForecastSection';
import {
  SkeletonResumoIA,
  SkeletonHourly,
} from './Skeletons';

type OverviewTabProps = {
  data: OceanographyResponse;
  hourlyData: HourlyMarinePoint[] | null;
  aiData: AiSummaryResponse | null;
  newsData: NewsResponse | null;
  hourlyLoading: boolean;
  aiLoading: boolean;
  newsLoading: boolean;
};

export function OverviewTab({
  data,
  hourlyData,
  aiData,
  newsData,
  hourlyLoading,
  aiLoading,
  newsLoading,
}: OverviewTabProps) {
  const latestNews = newsData?.news?.slice(0, 4) ?? [];

  return (
    <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" className="space-y-6">
      {/* 1. Resumo IA — full width */}
      <ForecastSection
        id="overview-resumo"
        title="Resumo do Dia"
        icon={<span aria-hidden="true">🤖</span>}
        ariaLabel="Resumo inteligente das condições"
      >
        {aiLoading ? <SkeletonResumoIA /> : <ResumoIA summary={aiData?.summary ?? null} loading={aiLoading} error={null} />}
      </ForecastSection>

      {/* 2. Condições de Ondas — full width, 5 cards */}
      <ForecastSection
        id="overview-condicoes"
        title="Condições de Ondas"
        icon={<FaWater className="w-4 h-4 text-cyan-400" aria-hidden="true" />}
        ariaLabel="Condições atuais de ondas"
      >
        <ConditionCards
          waveHeight={data.current.waveHeight}
          wavePeriod={data.current.wavePeriod}
          waveDirection={data.current.waveDirection}
          swellHeight={data.current.swellHeight}
          qualityLabel={data.qualityLabel}
          qualityEmoji={data.qualityEmoji}
        />
      </ForecastSection>

      {/* 3. Condições de Vento — full width, 5 cards */}
      <ForecastSection
        id="overview-vento"
        title="Condições de Vento"
        icon={<FaWind className="w-4 h-4 text-blue-400" aria-hidden="true" />}
        ariaLabel="Condições atuais do vento"
      >
        {hourlyLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-700" />
                <div className="h-5 bg-slate-700 rounded w-12" />
                <div className="h-3 bg-slate-700 rounded w-16" />
              </div>
            ))}
          </div>
        ) : hourlyData && hourlyData.length > 0 ? (
          <WindConditionCards
            windSpeed={hourlyData[0].windSpeed}
            windDirection={hourlyData[0].windDirection}
            windGust={hourlyData[0].windGust}
          />
        ) : (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-slate-500">
            Dados de vento indisponíveis
          </div>
        )}
      </ForecastSection>

      {/* 4. Próximas Horas — full width */}
      <ForecastSection
        id="overview-horas"
        title="Próximas Horas — Ondas"
        icon={<span aria-hidden="true">⏱️</span>}
        ariaLabel="Próximas horas de ondas"
      >
        {hourlyLoading ? <SkeletonHourly /> : hourlyData && <HourlySwell data={hourlyData} />}
      </ForecastSection>

      {/* 5. Todos os Picos — full width, 2 linhas de 5 */}
      <ForecastSection
        id="overview-picos"
        title="Todos os Picos"
        icon={<FaMapMarkerAlt className="w-4 h-4 text-blue-400" aria-hidden="true" />}
        ariaLabel="Todos os picos de surf"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {SPOTS.map(spot => {
            const cfg = LEVEL_CONFIG[spot.level] ?? LEVEL_CONFIG.beginner;
            return (
              <div
                key={spot.id}
                className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border} hover:scale-[1.02] transition-transform`}
              >
                <h4 className="text-sm font-bold text-white truncate">{spot.name}</h4>
                <span className={`text-[10px] font-medium ${cfg.color}`}>
                  {cfg.emoji} {cfg.label}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 truncate">{spot.bestWind}</p>
              </div>
            );
          })}
        </div>
      </ForecastSection>

      {/* 6. Últimas Notícias — full width */}
      <ForecastSection
        id="overview-noticias"
        title="Últimas Notícias"
        icon={<FaNewspaper className="w-4 h-4 text-orange-400" aria-hidden="true" />}
        ariaLabel="Últimas notícias de surf"
      >
        <SurfNews news={latestNews} loading={newsLoading} category="WSL" title="" />
      </ForecastSection>

      {/* 7. Dica do Dia — full width */}
      <ForecastSection
        id="overview-dica"
        title="Dica do Dia"
        icon={<span aria-hidden="true">💡</span>}
        ariaLabel="Dica do dia para surf"
      >
        <DailyTip
          waveHeight={data.current.waveHeight}
          wavePeriod={data.current.wavePeriod}
          qualityLabel={data.qualityLabel}
          bestTime={data.bestTime}
        />
      </ForecastSection>
    </div>
  );
}
