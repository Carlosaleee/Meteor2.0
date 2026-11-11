'use client';

import { useState, useEffect } from 'react';
import { FaWater, FaClock, FaSyncAlt } from 'react-icons/fa';
import { PageBanner } from '@/components/PageBanner';
import { useSwell } from '@/hooks/useSwell';
import { useHourlyMarine } from '@/hooks/useHourlyMarine';
import { useAiSummary } from '@/hooks/useAiSummary';
import { useNews } from '@/hooks/useNews';
import { SwellTabs } from './components/SwellTabs';
import { OverviewTab } from './components/OverviewTab';
import { ResumoIA } from './components/ResumoIA';
import { WaveChart } from './components/WaveChart';
import { TideChart } from './components/TideChart';
import { SpotGrid } from './components/SpotGrid';
import dynamic from 'next/dynamic';
const SpotsMap = dynamic(() => import('./components/SpotsMap').then(mod => mod.SpotsMap), { ssr: false });
import { SurfNews } from './components/SurfNews';
import { SPOTS, type Spot } from '@/lib/spots-data';
import { HourlySwell } from './components/HourlySwell';
import { ConditionCards } from './components/ConditionCards';
import { DailyTip } from './components/DailyTip';
import { WslRankings } from './components/WslRankings';
import { UpcomingEvents } from './components/UpcomingEvents';
import { WindConditionCards } from './components/WindConditionCards';
import { WindChart } from './components/WindChart';
import { HourlyWind } from './components/HourlyWind';
import { ForecastSection } from './components/ForecastSection';
import { resolveSwellTab, type SwellTab } from './tabs';
import { useDict, useI18n } from '@/i18n/context';
import { swell } from '@/i18n/dictionaries/swell';
import { fmt } from '@/i18n/format';
import {
  SkeletonResumoIA,
  SkeletonWaveChart,
  SkeletonTideChart,
  SkeletonHourly,
  SkeletonRankings,
  SkeletonEvents,
} from './components/Skeletons';

function waveDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

export default function SwellPage() {
  const [activeTab, setActiveTab] = useState<SwellTab>('overview');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const { data, loading, error, refetch } = useSwell();
  const { data: hourlyData, loading: hourlyLoading, refetch: refetchHourly } = useHourlyMarine();
  const { data: aiData, loading: aiLoading } = useAiSummary();
  const { data: newsData, loading: newsLoading, refetch: refetchNews } = useNews();
  const t = useDict(swell);
  const { lang } = useI18n();
  const locale = lang === 'pt' ? 'pt-BR' : 'es-ES';

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => setUserPosition(null),
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, []);

  // Deep-link ?tab=overview|news|forecast|wind|spots (CTAs da capa) — lido na
  // montagem para nao depender de searchParams no prerender estatico. Tab
  // invalida cai para 'overview' e a query e limpa da URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('tab');
    if (!requested) return;
    setActiveTab(resolveSwellTab(requested, activeTab));
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const handleRefresh = () => {
    refetch();
    refetchHourly();
    refetchNews();
  };

  const handleSelectSpot = (spot: Spot) => {
    setSelectedSpot(prev => prev?.id === spot.id ? null : spot);
  };

  const handleClearSpotRoute = () => {
    setSelectedSpot(null);
  };

  return (
    <div className="space-y-8">
      <PageBanner title={t['page.title']} subtitle={t['page.subtitle']} />

      {/* Skip links for accessibility */}
      <nav aria-label={t['skip.aria']} className="sr-only focus-within:not-sr-only">
        <a href="#condicoes" className="block p-2 bg-cyan-700 text-white rounded-lg">{t['skip.conditions']}</a>
        <a href="#grafico" className="block p-2 bg-cyan-700 text-white rounded-lg">{t['skip.chart']}</a>
        <a href="#horas" className="block p-2 bg-cyan-700 text-white rounded-lg">{t['skip.hours']}</a>
        <a href="#mares" className="block p-2 bg-cyan-700 text-white rounded-lg">{t['skip.tides']}</a>
      </nav>

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="space-y-8">
          <div className="bg-card border border-card-border rounded-3xl p-6 md:p-10 animate-pulse">
            <div className="h-8 bg-card-2 rounded w-64 mb-4" />
            <div className="h-4 bg-card-2 rounded w-48" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card border border-card-border rounded-2xl p-5 shadow-lg animate-pulse">
                <div className="h-3 bg-card-2 rounded w-20 mb-3" />
                <div className="h-8 bg-card-2 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Hero Banner */}
          <div
            className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-600/30"
            role="banner"
            aria-label={t['hero.aria']}
          >
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm" aria-hidden="true">
                  <FaWater className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">{t['hero.title']}</h2>
                  <p className="text-blue-200 text-sm mt-1">{data.location}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-sm"
                  title={fmt(t['a11y.quality'], { value: data.qualityLabel })}
                  aria-label={fmt(t['a11y.quality'], { value: data.qualityLabel })}
                >
                  <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">{t['kpi.quality']}</p>
                  <p className="text-2xl font-extrabold flex items-center gap-2 text-emerald-100">
                    <span aria-hidden="true">{data.qualityEmoji}</span>
                    <span>{data.qualityLabel}</span>
                  </p>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-sm"
                  title={fmt(t['a11y.bestTime'], { value: data.bestTime })}
                  aria-label={fmt(t['a11y.bestTime'], { value: data.bestTime })}
                >
                  <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <FaClock className="w-3.5 h-3.5" aria-hidden="true" /> {t['kpi.bestTime']}
                  </p>
                  <p className="text-2xl font-extrabold text-card-text">{data.bestTime}</p>
                </div>

                <button
                  onClick={handleRefresh}
                  title={t['a11y.refreshTitle']}
                  aria-label={t['a11y.refresh']}
                  className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-card-text/80 hover:text-card-text hover:bg-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <FaSyncAlt className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="bg-card/80 border border-card-border rounded-xl p-4 flex flex-col gap-2 hover:border-card-line transition-colors"
              title={fmt(t['a11y.waveHeight'], { value: data.current.waveHeight })}
              aria-label={fmt(t['a11y.waveHeight'], { value: data.current.waveHeight })}
            >
              <span className="text-xs font-semibold text-card-muted">{t['kpi.waveHeight']}</span>
              <p className="text-4xl font-extrabold text-card-text">
                {data.current.waveHeight} <span className="text-sm font-normal text-card-muted">{t['kpi.meters']}</span>
              </p>
              <p className="text-[11px] text-emerald-400">{fmt(t['kpi.period'], { value: data.current.wavePeriod })}</p>
            </div>

            <div
              className="bg-card/80 border border-card-border rounded-xl p-4 flex flex-col gap-2 hover:border-card-line transition-colors"
              title={fmt(t['a11y.swell'], { value: data.current.swellHeight })}
              aria-label={fmt(t['a11y.swell'], { value: data.current.swellHeight })}
            >
              <span className="text-xs font-semibold text-card-muted">{t['kpi.swell']}</span>
              <p className="text-4xl font-extrabold text-card-text">
                {data.current.swellHeight} <span className="text-sm font-normal text-card-muted">{t['kpi.meters']}</span>
              </p>
              <p className="text-[11px] text-blue-400">
                {fmt(t['kpi.periodDir'], { value: data.current.swellPeriod, dir: waveDir(data.current.swellDirection) })}
              </p>
            </div>

            <div
              className="bg-card/80 border border-card-border rounded-xl p-4 flex flex-col gap-2 hover:border-card-line transition-colors"
              title={fmt(t['a11y.direction'], { value: data.current.waveDirection })}
              aria-label={fmt(t['a11y.direction'], { value: data.current.waveDirection })}
            >
              <span className="text-xs font-semibold text-card-muted">{t['kpi.direction']}</span>
              <p className="text-4xl font-extrabold text-card-text">
                {data.current.waveDirection}° <span className="text-sm font-normal text-card-muted">{waveDir(data.current.waveDirection)}</span>
              </p>
              <p className="text-[11px] text-card-dim">{t['kpi.coastEntry']}</p>
            </div>

            <div
              className="bg-card/80 border border-card-border rounded-xl p-4 flex flex-col gap-2 hover:border-card-line transition-colors"
              title={fmt(t['a11y.nextTide'], { value: data.nextTide })}
              aria-label={fmt(t['a11y.nextTide'], { value: data.nextTide })}
            >
              <span className="text-xs font-semibold text-card-muted">{t['kpi.nextTide']}</span>
              <p className="text-4xl font-extrabold text-card-text">{data.nextTide}</p>
              <p className="text-[11px] text-amber-400">{fmt(t['kpi.coefficient'], { value: data.tideCoefficient })}</p>
            </div>
          </div>

          {/* Tabs */}
          <SwellTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Visão Geral — Aba overview */}
          {activeTab === 'overview' && (
            <OverviewTab
              data={data}
              hourlyData={hourlyData}
              aiData={aiData}
              newsData={newsData}
              hourlyLoading={hourlyLoading}
              aiLoading={aiLoading}
              newsLoading={newsLoading}
            />
          )}

          {/* Notícias — Aba Noticias */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <SurfNews news={newsData?.news ?? []} loading={newsLoading} category="WSL" title="World Surf League" />
              {newsLoading && !newsData ? (
                <SkeletonRankings />
              ) : newsData?.rankings ? (
                <WslRankings men={newsData.rankings.men} women={newsData.rankings.women} loading={newsLoading} />
              ) : null}
              <SurfNews news={newsData?.news ?? []} loading={newsLoading} category="Paulista" title="Circuito Paulista" />
              {newsLoading && !newsData ? (
                <SkeletonEvents />
              ) : newsData?.events ? (
                <UpcomingEvents events={newsData.events} loading={newsLoading} />
              ) : null}
            </div>
          )}

          {/* Previsão de Ondas — Aba forecast */}
          {activeTab === 'forecast' && (
            <div role="tabpanel" id="panel-forecast" aria-labelledby="tab-forecast" className="space-y-6">
              {/* Section navigation */}
              <nav aria-label={t['section.forecastNav']} className="flex flex-wrap gap-2 text-xs">
                <a href="#condicoes" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.conditions']}</a>
                <a href="#grafico" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.chart']}</a>
                <a href="#horas" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.hours']}</a>
                <a href="#mares" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.tides']}</a>
                <a href="#resumo" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.aiSummary']}</a>
                <a href="#dica" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.tip']}</a>
              </nav>

              <ForecastSection
                id="condicoes"
                title={t['section.conditions']}
                icon={<FaWater className="w-5 h-5 text-cyan-400" aria-hidden="true" />}
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

              <ForecastSection
                id="grafico"
                title={t['section.waveChart']}
                icon={<span aria-hidden="true">📊</span>}
                ariaLabel={t['section.waveChartAria']}
              >
                {hourlyLoading ? <SkeletonWaveChart /> : hourlyData && <WaveChart data={hourlyData} />}
              </ForecastSection>

              <ForecastSection
                id="horas"
                title={t['section.hours']}
                icon={<span aria-hidden="true">⏱️</span>}
                ariaLabel={t['section.hoursAria']}
              >
                {hourlyLoading ? <SkeletonHourly /> : hourlyData && <HourlySwell data={hourlyData} />}
              </ForecastSection>

              <ForecastSection
                id="mares"
                title={t['section.tides']}
                icon={<span aria-hidden="true">🌙</span>}
                ariaLabel={t['section.tidesAria']}
              >
                {hourlyLoading ? <SkeletonTideChart /> : hourlyData && <TideChart data={hourlyData} />}
              </ForecastSection>

              <ForecastSection
                id="resumo"
                title={t['section.aiSummary']}
                icon={<span aria-hidden="true">🤖</span>}
                ariaLabel={t['section.aiSummaryAria']}
              >
                {aiLoading ? <SkeletonResumoIA /> : <ResumoIA summary={aiData?.summary ?? null} loading={aiLoading} error={null} />}
              </ForecastSection>

              <ForecastSection
                id="dica"
                title={t['section.tip']}
                icon={<span aria-hidden="true">💡</span>}
                ariaLabel={t['section.tipAria']}
              >
                <DailyTip
                  waveHeight={data.current.waveHeight}
                  wavePeriod={data.current.wavePeriod}
                  qualityLabel={data.qualityLabel}
                  bestTime={data.bestTime}
                />
              </ForecastSection>
            </div>
          )}

          {/* Previsão de Ventos — Aba wind */}
          {activeTab === 'wind' && (
            <div role="tabpanel" id="panel-wind" aria-labelledby="tab-wind" className="space-y-6">
              {/* Section navigation */}
              <nav aria-label={t['section.windNav']} className="flex flex-wrap gap-2 text-xs">
                <a href="#wind-condicoes" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.conditions']}</a>
                <a href="#wind-grafico" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.chart']}</a>
                <a href="#wind-horas" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.hours']}</a>
                <a href="#wind-mares" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.tides']}</a>
                <a href="#wind-resumo" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.aiSummary']}</a>
                <a href="#wind-dica" className="px-3 py-1.5 rounded-full bg-card-2/60 border border-card-line/50 text-card-subtle hover:bg-card-line/60 hover:text-card-text transition-colors">{t['nav.tip']}</a>
              </nav>

              <ForecastSection
                id="wind-condicoes"
                title={t['section.windConditions']}
                icon={<span aria-hidden="true">💨</span>}
                ariaLabel={t['section.windConditionsAria']}
              >
                {hourlyLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-card border border-card-border rounded-2xl p-5 shadow-lg animate-pulse">
                        <div className="h-3 bg-card-2 rounded w-20 mb-3" />
                        <div className="h-8 bg-card-2 rounded w-16" />
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
                    {t['empty.wind']}
                  </div>
                )}
              </ForecastSection>

              <ForecastSection
                id="wind-grafico"
                title={t['section.windChart']}
                icon={<span aria-hidden="true">📊</span>}
                ariaLabel={t['section.windChartAria']}
              >
                {hourlyLoading ? <SkeletonWaveChart /> : hourlyData && hourlyData.length > 0 ? <WindChart data={hourlyData} /> : (
                  <div className="bg-card/80 border border-card-border rounded-2xl p-5 text-center text-card-dim">
                    {t['empty.windChart']}
                  </div>
                )}
              </ForecastSection>

              <ForecastSection
                id="wind-horas"
                title={t['section.windHours']}
                icon={<span aria-hidden="true">⏱️</span>}
                ariaLabel={t['section.windHoursAria']}
              >
                {hourlyLoading ? <SkeletonHourly /> : hourlyData && hourlyData.length > 0 ? <HourlyWind data={hourlyData} /> : (
                  <div className="bg-card/80 border border-card-border rounded-2xl p-5 text-center text-card-dim">
                    {t['empty.windHours']}
                  </div>
                )}
              </ForecastSection>

              <ForecastSection
                id="wind-mares"
                title={t['section.tides']}
                icon={<span aria-hidden="true">🌙</span>}
                ariaLabel={t['section.tidesAria']}
              >
                {hourlyLoading ? <SkeletonTideChart /> : hourlyData && <TideChart data={hourlyData} />}
              </ForecastSection>

              <ForecastSection
                id="wind-resumo"
                title={t['section.windAiSummary']}
                icon={<span aria-hidden="true">🤖</span>}
                ariaLabel={t['section.windAiSummaryAria']}
              >
                {aiLoading ? <SkeletonResumoIA /> : <ResumoIA summary={aiData?.summary ?? null} loading={aiLoading} error={null} />}
              </ForecastSection>

              <ForecastSection
                id="wind-dica"
                title={t['section.windTip']}
                icon={<span aria-hidden="true">💡</span>}
                ariaLabel={t['section.windTipAria']}
              >
                <DailyTip
                  waveHeight={data.current.waveHeight}
                  wavePeriod={data.current.wavePeriod}
                  qualityLabel={data.qualityLabel}
                  bestTime={data.bestTime}
                />
              </ForecastSection>
            </div>
          )}

          {/* Picos — Aba spots */}
          {activeTab === 'spots' && (
            <div role="tabpanel" id="panel-spots" aria-labelledby="tab-spots" className="space-y-6">
              <SpotsMap
                spots={SPOTS}
                selectedSpot={selectedSpot}
                userPosition={userPosition}
                onSelectSpot={handleSelectSpot}
                onClearRoute={handleClearSpotRoute}
              />
              <SpotGrid
                spots={SPOTS}
                selectedSpot={selectedSpot}
                onSelectSpot={handleSelectSpot}
              />
            </div>
          )}

          <p className="text-[11px] text-card-faint text-right">
            {fmt(t['footer.lastUpdate'], { date: new Date(data.timestamp).toLocaleString(locale) })}
          </p>
        </>
      )}

    </div>
  );
}
