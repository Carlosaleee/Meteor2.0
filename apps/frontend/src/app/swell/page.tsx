'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaWater, FaClock, FaSyncAlt } from 'react-icons/fa';
import { ChatWidget } from '@/components/ChatWidget';
import { PageBanner } from '@/components/PageBanner';
import { useSwell } from '@/hooks/useSwell';
import { useHourlyMarine } from '@/hooks/useHourlyMarine';
import { useAiSummary } from '@/hooks/useAiSummary';
import { useNews } from '@/hooks/useNews';
import { SwellTabs } from './components/SwellTabs';
import { ResumoIA } from './components/ResumoIA';
import { WaveChart } from './components/WaveChart';
import { TideChart } from './components/TideChart';
import { SpotGrid } from './components/SpotGrid';
import { SurfNews } from './components/SurfNews';
import { HourlySwell } from './components/HourlySwell';
import { ConditionCards } from './components/ConditionCards';
import { DailyTip } from './components/DailyTip';
import { WslRankings } from './components/WslRankings';
import { UpcomingEvents } from './components/UpcomingEvents';
import { WindConditionCards } from './components/WindConditionCards';
import { WindChart } from './components/WindChart';
import { HourlyWind } from './components/HourlyWind';
import {
  SkeletonResumoIA,
  SkeletonWaveChart,
  SkeletonTideChart,
  SkeletonSpotGrid,
  SkeletonHourly,
  SkeletonRankings,
  SkeletonEvents,
} from './components/Skeletons';

const SwellMap = dynamic(() => import('@/components/SwellMapClient').then(mod => mod.SwellMapClient), { ssr: false });

function waveDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

export default function SwellPage() {
  const [activeTab, setActiveTab] = useState('news');
  const { data, loading, error, refetch } = useSwell();
  const { data: hourlyData, loading: hourlyLoading, refetch: refetchHourly } = useHourlyMarine();
  const { data: aiData, loading: aiLoading } = useAiSummary();
  const { data: newsData, loading: newsLoading, refetch: refetchNews } = useNews();

  useEffect(() => {
    refetch();
    refetchHourly();
    refetchNews();
  }, [refetch, refetchHourly, refetchNews]);

  const handleRefresh = () => {
    refetch();
    refetchHourly();
    refetchNews();
  };

  return (
    <div className="space-y-8">
      <PageBanner title="Swell & Picos" subtitle="Telemetria de ondas, marés e picos de surf em Ilha Comprida" />

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
              <section id="condicoes" aria-label="Condições atuais" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaWater className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                  Condições Atuais
                </h2>
                <ConditionCards
                  waveHeight={data.current.waveHeight}
                  wavePeriod={data.current.wavePeriod}
                  waveDirection={data.current.waveDirection}
                  swellHeight={data.current.swellHeight}
                  qualityLabel={data.qualityLabel}
                  qualityEmoji={data.qualityEmoji}
                />
              </section>

              <section id="grafico" aria-label="Gráfico horário de ondas" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">📊</span>
                  Gráfico Horário — Ondas
                </h2>
                {hourlyLoading ? <SkeletonWaveChart /> : hourlyData && <WaveChart data={hourlyData} />}
              </section>

              <section id="horas" aria-label="Próximas horas" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">⏱️</span>
                  Próximas Horas
                </h2>
                {hourlyLoading ? <SkeletonHourly /> : hourlyData && <HourlySwell data={hourlyData} />}
              </section>

              <section id="mares" aria-label="Previsão de marés" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">🌙</span>
                  Marés
                </h2>
                {hourlyLoading ? <SkeletonTideChart /> : hourlyData && <TideChart data={hourlyData} />}
              </section>

              <section id="resumo" aria-label="Resumo IA" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">🤖</span>
                  Resumo IA — Gemini Flash
                </h2>
                {aiLoading ? <SkeletonResumoIA /> : <ResumoIA summary={aiData?.summary ?? null} loading={aiLoading} error={null} />}
              </section>

              <section id="dica" aria-label="Dica do dia" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">💡</span>
                  Dica do Dia
                </h2>
                <DailyTip
                  waveHeight={data.current.waveHeight}
                  wavePeriod={data.current.wavePeriod}
                  qualityLabel={data.qualityLabel}
                  bestTime={data.bestTime}
                />
              </section>
            </div>
          )}

          {/* Previsão de Ventos — Aba wind */}
          {activeTab === 'wind' && (
            <div role="tabpanel" id="panel-wind" aria-labelledby="tab-wind" className="space-y-6">
              <section id="wind-condicoes" aria-label="Condições do vento" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">💨</span>
                  Condições do Vento
                </h2>
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
              </section>

              <section id="wind-grafico" aria-label="Gráfico horário de vento" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">📊</span>
                  Gráfico Horário — Ventos
                </h2>
                {hourlyLoading ? <SkeletonWaveChart /> : hourlyData && hourlyData.length > 0 ? <WindChart data={hourlyData} /> : (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-slate-500">
                    Gráfico de ventos indisponível
                  </div>
                )}
              </section>

              <section id="wind-horas" aria-label="Próximas horas vento" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">⏱️</span>
                  Próximas Horas — Ventos
                </h2>
                {hourlyLoading ? <SkeletonHourly /> : hourlyData && hourlyData.length > 0 ? <HourlyWind data={hourlyData} /> : (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-slate-500">
                    Previsão horária de ventos indisponível
                  </div>
                )}
              </section>

              <section id="wind-mares" aria-label="Marés e vento" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">🌙</span>
                  Marés
                </h2>
                {hourlyLoading ? <SkeletonTideChart /> : hourlyData && <TideChart data={hourlyData} />}
              </section>

              <section id="wind-resumo" aria-label="Resumo IA vento" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">🤖</span>
                  Resumo IA — Kitesurf & Windsurf
                </h2>
                {aiLoading ? <SkeletonResumoIA /> : <ResumoIA summary={aiData?.summary ?? null} loading={aiLoading} error={null} />}
              </section>

              <section id="wind-dica" aria-label="Dica do dia vento" className="scroll-mt-20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span aria-hidden="true">💡</span>
                  Dica do Dia
                </h2>
                <DailyTip
                  waveHeight={data.current.waveHeight}
                  wavePeriod={data.current.wavePeriod}
                  qualityLabel={data.qualityLabel}
                  bestTime={data.bestTime}
                />
              </section>
            </div>
          )}

          {/* Picos — Aba spots */}
          {activeTab === 'spots' && (
            <div role="tabpanel" id="panel-spots" aria-labelledby="tab-spots" className="space-y-6">
              {data.spots.length > 0 ? (
                <SpotGrid spots={data.spots} />
              ) : (
                <SkeletonSpotGrid />
              )}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  Mapa de Picos de Surf — Ilha Comprida
                </h3>
                <p className="text-xs text-slate-400 mb-4">Clique nos marcadores para conferir o nível de dificuldade e dicas dos picos</p>
                <div className="h-[450px] rounded-xl overflow-hidden border border-slate-800">
                  <SwellMap />
                </div>
              </div>
            </div>
          )}

          {/* Localismo — Aba local */}
          {activeTab === 'local' && (
            <div role="tabpanel" id="panel-local" aria-labelledby="tab-local" className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <span aria-hidden="true">📍</span>
                  Localismo — Ilha Comprida & Costa
                </h3>
                <p className="text-sm text-slate-400">Picos, comércio local e utilidades públicas</p>
                <p className="text-sm text-cyan-400 mt-2">Será implementado na branch <code>feature/swell-localismo</code></p>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-600 text-right">
            Última atualização: {new Date(data.timestamp).toLocaleString('pt-BR')}
          </p>
        </>
      )}

      <ChatWidget />
    </div>
  );
}
