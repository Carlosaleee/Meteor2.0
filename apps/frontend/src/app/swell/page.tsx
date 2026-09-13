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
import { SpotsMap } from './components/SpotsMap';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const { data, loading, error, refetch } = useSwell();
  const { data: hourlyData, loading: hourlyLoading, refetch: refetchHourly } = useHourlyMarine();
  const { data: aiData, loading: aiLoading } = useAiSummary();
  const { data: newsData, loading: newsLoading, refetch: refetchNews } = useNews();

  useEffect(() => {
    refetch();
    refetchHourly();
    refetchNews();
  }, [refetch, refetchHourly, refetchNews]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => setUserPosition(null),
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
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
      <PageBanner title="Swell & Picos" subtitle="Telemetria de ondas, marés e picos de surf em Ilha Comprida" />

      {/* Skip links for accessibility */}
      <nav aria-label="Navegação rápida" className="sr-only focus-within:not-sr-only">
        <a href="#condicoes" className="block p-2 bg-cyan-600 text-white rounded-lg">Pular para Condições</a>
        <a href="#grafico" className="block p-2 bg-cyan-600 text-white rounded-lg">Pular para Gráfico</a>
        <a href="#horas" className="block p-2 bg-cyan-600 text-white rounded-lg">Pular para Próximas Horas</a>
        <a href="#mares" className="block p-2 bg-cyan-600 text-white rounded-lg">Pular para Marés</a>
      </nav>

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-64 mb-4" />
            <div className="h-4 bg-slate-800 rounded w-48" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg animate-pulse">
                <div className="h-3 bg-slate-800 rounded w-20 mb-3" />
                <div className="h-8 bg-slate-800 rounded w-16" />
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
            aria-label="Condições atuais de swell"
          >
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm" aria-hidden="true">
                  <FaWater className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">Condições de Swell & Mar</h2>
                  <p className="text-blue-200 text-sm mt-1">{data.location}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-sm"
                  title={`Qualidade: ${data.qualityLabel}`}
                  aria-label={`Qualidade do surf: ${data.qualityLabel}`}
                >
                  <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Qualidade</p>
                  <p className="text-2xl font-extrabold flex items-center gap-2 text-emerald-100">
                    <span aria-hidden="true">{data.qualityEmoji}</span>
                    <span>{data.qualityLabel}</span>
                  </p>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-sm"
                  title={`Melhor horário para surf: ${data.bestTime}`}
                  aria-label={`Melhor horário: ${data.bestTime}`}
                >
                  <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <FaClock className="w-3.5 h-3.5" aria-hidden="true" /> Melhor Horário
                  </p>
                  <p className="text-2xl font-extrabold text-white">{data.bestTime}</p>
                </div>

                <button
                  onClick={handleRefresh}
                  title="Atualizar dados de swell, ondas e notícias"
                  aria-label="Atualizar dados"
                  className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <FaSyncAlt className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-slate-700 transition-colors"
              title={`Altura da onda: ${data.current.waveHeight} metros, período ${data.current.wavePeriod}s`}
              aria-label={`Altura da onda: ${data.current.waveHeight} metros`}
            >
              <span className="text-xs font-semibold text-slate-400">Altura da Onda</span>
              <p className="text-4xl font-extrabold text-white">
                {data.current.waveHeight} <span className="text-sm font-normal text-slate-400">metros</span>
              </p>
              <p className="text-[11px] text-emerald-400">Período: {data.current.wavePeriod}s</p>
            </div>

            <div
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-slate-700 transition-colors"
              title={`Swell: ${data.current.swellHeight} metros, período ${data.current.swellPeriod}s, direção ${waveDir(data.current.swellDirection)}`}
              aria-label={`Swell: ${data.current.swellHeight} metros`}
            >
              <span className="text-xs font-semibold text-slate-400">Swell</span>
              <p className="text-4xl font-extrabold text-white">
                {data.current.swellHeight} <span className="text-sm font-normal text-slate-400">metros</span>
              </p>
              <p className="text-[11px] text-blue-400">
                Período: {data.current.swellPeriod}s · {waveDir(data.current.swellDirection)}
              </p>
            </div>

            <div
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-slate-700 transition-colors"
              title={`Direção principal: ${data.current.waveDirection} graus ${waveDir(data.current.waveDirection)}`}
              aria-label={`Direção: ${data.current.waveDirection} graus ${waveDir(data.current.waveDirection)}`}
            >
              <span className="text-xs font-semibold text-slate-400">Direção Principal</span>
              <p className="text-4xl font-extrabold text-white">
                {data.current.waveDirection}° <span className="text-sm font-normal text-slate-400">{waveDir(data.current.waveDirection)}</span>
              </p>
              <p className="text-[11px] text-slate-500">Entrada na costa</p>
            </div>

            <div
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-slate-700 transition-colors"
              title={`Próxima maré alta: ${data.nextTide}, coeficiente ${data.tideCoefficient}`}
              aria-label={`Próxima maré alta: ${data.nextTide}`}
            >
              <span className="text-xs font-semibold text-slate-400">Próxima Maré Alta</span>
              <p className="text-4xl font-extrabold text-white">{data.nextTide}</p>
              <p className="text-[11px] text-amber-400">Coeficiente: {data.tideCoefficient}</p>
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
              <nav aria-label="Seções da previsão de ondas" className="flex flex-wrap gap-2 text-xs">
                <a href="#condicoes" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Condições</a>
                <a href="#grafico" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Gráfico</a>
                <a href="#horas" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Próximas Horas</a>
                <a href="#mares" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Marés</a>
                <a href="#resumo" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Resumo IA</a>
                <a href="#dica" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Dica</a>
              </nav>

              <ForecastSection
                id="condicoes"
                title="Condições Atuais"
                icon={<FaWater className="w-5 h-5 text-cyan-400" aria-hidden="true" />}
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

              <ForecastSection
                id="grafico"
                title="Gráfico Horário — Ondas"
                icon={<span aria-hidden="true">📊</span>}
                ariaLabel="Gráfico horário de ondas"
              >
                {hourlyLoading ? <SkeletonWaveChart /> : hourlyData && <WaveChart data={hourlyData} />}
              </ForecastSection>

              <ForecastSection
                id="horas"
                title="Próximas Horas"
                icon={<span aria-hidden="true">⏱️</span>}
                ariaLabel="Próximas horas de ondas"
              >
                {hourlyLoading ? <SkeletonHourly /> : hourlyData && <HourlySwell data={hourlyData} />}
              </ForecastSection>

              <ForecastSection
                id="mares"
                title="Marés"
                icon={<span aria-hidden="true">🌙</span>}
                ariaLabel="Previsão de marés"
              >
                {hourlyLoading ? <SkeletonTideChart /> : hourlyData && <TideChart data={hourlyData} />}
              </ForecastSection>

              <ForecastSection
                id="resumo"
                title="Resumo IA — Gemini Flash"
                icon={<span aria-hidden="true">🤖</span>}
                ariaLabel="Resumo inteligente das condições"
              >
                {aiLoading ? <SkeletonResumoIA /> : <ResumoIA summary={aiData?.summary ?? null} loading={aiLoading} error={null} />}
              </ForecastSection>

              <ForecastSection
                id="dica"
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
          )}

          {/* Previsão de Ventos — Aba wind */}
          {activeTab === 'wind' && (
            <div role="tabpanel" id="panel-wind" aria-labelledby="tab-wind" className="space-y-6">
              {/* Section navigation */}
              <nav aria-label="Seções da previsão de ventos" className="flex flex-wrap gap-2 text-xs">
                <a href="#wind-condicoes" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Condições</a>
                <a href="#wind-grafico" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Gráfico</a>
                <a href="#wind-horas" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Próximas Horas</a>
                <a href="#wind-mares" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Marés</a>
                <a href="#wind-resumo" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Resumo IA</a>
                <a href="#wind-dica" className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">Dica</a>
              </nav>

              <ForecastSection
                id="wind-condicoes"
                title="Condições do Vento"
                icon={<span aria-hidden="true">💨</span>}
                ariaLabel="Condições atuais do vento"
              >
                {hourlyLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg animate-pulse">
                        <div className="h-3 bg-slate-800 rounded w-20 mb-3" />
                        <div className="h-8 bg-slate-800 rounded w-16" />
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
                    Dados de vento indisponíveis no momento
                  </div>
                )}
              </ForecastSection>

              <ForecastSection
                id="wind-grafico"
                title="Gráfico Horário — Ventos"
                icon={<span aria-hidden="true">📊</span>}
                ariaLabel="Gráfico horário de ventos"
              >
                {hourlyLoading ? <SkeletonWaveChart /> : hourlyData && hourlyData.length > 0 ? <WindChart data={hourlyData} /> : (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-slate-500">
                    Gráfico de ventos indisponível
                  </div>
                )}
              </ForecastSection>

              <ForecastSection
                id="wind-horas"
                title="Próximas Horas — Ventos"
                icon={<span aria-hidden="true">⏱️</span>}
                ariaLabel="Próximas horas de ventos"
              >
                {hourlyLoading ? <SkeletonHourly /> : hourlyData && hourlyData.length > 0 ? <HourlyWind data={hourlyData} /> : (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-slate-500">
                    Previsão horária de ventos indisponível
                  </div>
                )}
              </ForecastSection>

              <ForecastSection
                id="wind-mares"
                title="Marés"
                icon={<span aria-hidden="true">🌙</span>}
                ariaLabel="Previsão de marés"
              >
                {hourlyLoading ? <SkeletonTideChart /> : hourlyData && <TideChart data={hourlyData} />}
              </ForecastSection>

              <ForecastSection
                id="wind-resumo"
                title="Resumo IA — Kitesurf & Windsurf"
                icon={<span aria-hidden="true">🤖</span>}
                ariaLabel="Resumo inteligente para kitesurf e windsurf"
              >
                {aiLoading ? <SkeletonResumoIA /> : <ResumoIA summary={aiData?.summary ?? null} loading={aiLoading} error={null} />}
              </ForecastSection>

              <ForecastSection
                id="wind-dica"
                title="Dica do Dia"
                icon={<span aria-hidden="true">💡</span>}
                ariaLabel="Dica do dia para kitesurf e windsurf"
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

          <p className="text-[11px] text-slate-600 text-right">
            Última atualização: {new Date(data.timestamp).toLocaleString('pt-BR')}
          </p>
        </>
      )}

    </div>
  );
}
