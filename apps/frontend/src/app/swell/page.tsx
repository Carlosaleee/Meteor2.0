'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FaWater, FaClock, FaSyncAlt } from 'react-icons/fa';
import { ChatWidget } from '@/components/ChatWidget';
import { PageBanner } from '@/components/PageBanner';
import { useSwell } from '@/hooks/useSwell';
import { useHourlyMarine } from '@/hooks/useHourlyMarine';
import { useAiSummary } from '@/hooks/useAiSummary';
import { SwellTabs } from './components/SwellTabs';
import { ResumoIA } from './components/ResumoIA';
import { WaveChart } from './components/WaveChart';
import { TideChart } from './components/TideChart';
import { SpotGrid } from './components/SpotGrid';
import { SurfNews } from './components/SurfNews';
import { HourlySwell } from './components/HourlySwell';
import { ConditionCards } from './components/ConditionCards';
import { DailyTip } from './components/DailyTip';
import {
  SkeletonResumoIA,
  SkeletonWaveChart,
  SkeletonTideChart,
  SkeletonSpotGrid,
  SkeletonSurfNews,
  SkeletonHourly,
} from './components/Skeletons';

const SwellMap = dynamic(() => import('@/components/SwellMapClient').then(mod => mod.SwellMapClient), { ssr: false });

function waveDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

export default function SwellPage() {
  const [activeTab, setActiveTab] = useState('news');
  const { data, loading, error, refetch } = useSwell();
  const { data: hourlyData, loading: hourlyLoading } = useHourlyMarine();
  const { data: aiData, loading: aiLoading } = useAiSummary();

  const handleRefresh = () => {
    refetch();
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
                  title="Atualizar dados de swell e ondas"
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

          {/* Tab Panels */}
          <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
            {activeTab === 'news' && (
              <SurfNews />
            )}

            {activeTab === 'waves' && (
              <div className="space-y-6">
                {hourlyLoading ? <SkeletonWaveChart /> : hourlyData && <WaveChart data={hourlyData} />}
                {hourlyLoading ? <SkeletonHourly /> : hourlyData && <HourlySwell data={hourlyData} />}
              </div>
            )}

            {activeTab === 'spots' && (
              <div className="space-y-6">
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

            {activeTab === 'tides' && (
              <div className="space-y-6">
                {hourlyLoading ? <SkeletonTideChart /> : hourlyData && <TideChart data={hourlyData} />}
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                {aiLoading ? <SkeletonResumoIA /> : <ResumoIA summary={aiData?.summary ?? null} loading={aiLoading} error={null} />}
                <ConditionCards
                  waveHeight={data.current.waveHeight}
                  wavePeriod={data.current.wavePeriod}
                  waveDirection={data.current.waveDirection}
                  swellHeight={data.current.swellHeight}
                  qualityLabel={data.qualityLabel}
                  qualityEmoji={data.qualityEmoji}
                />
                {hourlyLoading ? <SkeletonHourly /> : hourlyData && <HourlySwell data={hourlyData} />}
                <DailyTip
                  waveHeight={data.current.waveHeight}
                  wavePeriod={data.current.wavePeriod}
                  qualityLabel={data.qualityLabel}
                  bestTime={data.bestTime}
                />
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-600 text-right">
            Última atualização: {new Date(data.timestamp).toLocaleString('pt-BR')}
          </p>
        </>
      )}

      <ChatWidget />
    </div>
  );
}
