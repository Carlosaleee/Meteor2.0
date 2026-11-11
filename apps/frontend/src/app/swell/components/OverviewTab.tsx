'use client';

import { swell } from '@/i18n/dictionaries/swell';
import { useDict } from '@/i18n/context';
import { FaWater, FaWind, FaMapMarkerAlt, FaNewspaper } from 'react-icons/fa';
import type { OceanographyResponse, HourlyMarinePoint, AiSummaryResponse, NewsResponse, NewsItem } from '@/lib/api';
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

/**
 * Seleciona 3 notícias WSL + 3 Paulista, independentemente da ordem do feed.
 * O corte anterior (slice(0,4) + filtro category="WSL") renderizava 0 cards
 * quando os 4 primeiros itens eram Paulista — caso real do feed de produção.
 */
export function pickOverviewNews(news: NewsItem[] | undefined): NewsItem[] {
  if (!news) return [];
  return [
    ...news.filter(n => n.category === 'WSL').slice(0, 3),
    ...news.filter(n => n.category === 'Paulista').slice(0, 3),
  ];
}

export function OverviewTab({
  data,
  hourlyData,
  aiData,
  newsData,
  hourlyLoading,
  aiLoading,
  newsLoading,
}: OverviewTabProps) {
  const t = useDict(swell);
  const latestNews = pickOverviewNews(newsData?.news);

  return (
    <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" className="space-y-6">
      {/* 1. Resumo IA — full width */}
      <ForecastSection
        id="overview-resumo"
        title={t['ov.resumoTitle']}
        icon={<span aria-hidden="true">🤖</span>}
        ariaLabel={t['ov.resumoAria']}
      >
        {aiLoading ? <SkeletonResumoIA /> : <ResumoIA summary={aiData?.summary ?? null} loading={aiLoading} error={null} />}
      </ForecastSection>

      {/* 2. Condições de Ondas — full width, 5 cards */}
      <ForecastSection
        id="overview-condicoes"
        title={t['ov.wavesTitle']}
        icon={<FaWater className="w-4 h-4 text-cyan-400" aria-hidden="true" />}
        ariaLabel={t['section.conditionsAria']}
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
        title={t['ov.windTitle']}
        icon={<FaWind className="w-4 h-4 text-blue-400" aria-hidden="true" />}
        ariaLabel={t['section.windConditionsAria']}
      >
        {hourlyLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card-2/60 border border-card-line/50 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-card-line" />
                <div className="h-5 bg-card-line rounded w-12" />
                <div className="h-3 bg-card-line rounded w-16" />
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
          <div className="bg-card/80 border border-card-border rounded-2xl p-5 text-center text-card-dim">
            {t['ov.windEmpty']}
          </div>
        )}
      </ForecastSection>

      {/* 4. Próximas Horas — full width */}
      <ForecastSection
        id="overview-horas"
        title={t['ov.hoursTitle']}
        icon={<span aria-hidden="true">⏱️</span>}
        ariaLabel={t['section.hoursAria']}
      >
        {hourlyLoading ? <SkeletonHourly /> : hourlyData && <HourlySwell data={hourlyData} />}
      </ForecastSection>

      {/* 5. Todos os Points — full width, 2 linhas de 5 */}
      <ForecastSection
        id="overview-points"
        title={t['ov.spotsTitle']}
        icon={<FaMapMarkerAlt className="w-4 h-4 text-blue-400" aria-hidden="true" />}
        ariaLabel={t['ov.spotsAria']}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {SPOTS.map(spot => {
            const cfg = LEVEL_CONFIG[spot.level] ?? LEVEL_CONFIG.beginner;
            return (
              <div
                key={spot.id}
                className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border} hover:scale-[1.02] transition-transform`}
              >
                <h4 className="text-sm font-bold text-card-text truncate">{spot.name}</h4>
                <span className={`text-[10px] font-medium ${cfg.color}`}>
                  {cfg.emoji} {cfg.label}
                </span>
                <p className="text-[10px] text-card-muted mt-1 truncate">{spot.bestWind}</p>
              </div>
            );
          })}
        </div>
      </ForecastSection>

      {/* 6. Últimas Notícias — full width */}
      <ForecastSection
        id="overview-noticias"
        title={t['ov.newsTitle']}
        icon={<FaNewspaper className="w-4 h-4 text-orange-400" aria-hidden="true" />}
        ariaLabel={t['ov.newsAria']}
      >
        <SurfNews news={latestNews} loading={newsLoading} title="" />
      </ForecastSection>

      {/* 7. Dica do Dia — full width */}
      <ForecastSection
        id="overview-dica"
        title={t['ov.tipTitle']}
        icon={<span aria-hidden="true">💡</span>}
        ariaLabel={t['ov.tipAria']}
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
