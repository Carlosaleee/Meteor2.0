'use client';

import dynamic from 'next/dynamic';
import { FaWater, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { ChatWidget } from '@/components/ChatWidget';
import { useSwell } from '@/hooks/useSwell';

const SwellMap = dynamic(() => import('@/components/SwellMapClient').then(mod => mod.SwellMapClient), { ssr: false });

function waveDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

export default function SwellPage() {
  const { data, loading, error } = useSwell();

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4 text-red-300 text-sm">
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
          {/* Hero Banner de Qualidade do Mar */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-600/30">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                  <FaWater className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">Condições de Swell & Mar</h2>
                  <p className="text-blue-200 text-sm mt-1">{data.location}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-sm">
                  <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Qualidade</p>
                  <p className="text-2xl font-extrabold flex items-center gap-2 text-emerald-100">
                    <span>{data.qualityEmoji}</span>
                    <span>{data.qualityLabel}</span>
                  </p>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                  <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                    <FaClock className="w-3.5 h-3.5" /> Melhor Horário
                  </p>
                  <p className="text-2xl font-extrabold text-white">{data.bestTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards Oceanográficos */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold text-slate-400">Altura da Onda</span>
              <p className="text-4xl font-extrabold text-white mt-2">
                {data.current.waveHeight} <span className="text-sm font-normal text-slate-400">metros</span>
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">Período: {data.current.wavePeriod}s</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold text-slate-400">Swell</span>
              <p className="text-4xl font-extrabold text-white mt-2">
                {data.current.swellHeight} <span className="text-sm font-normal text-slate-400">metros</span>
              </p>
              <p className="text-[11px] text-blue-400 mt-1">
                Período: {data.current.swellPeriod}s · {waveDir(data.current.swellDirection)}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold text-slate-400">Direção Principal</span>
              <p className="text-4xl font-extrabold text-white mt-2">
                {data.current.waveDirection}° <span className="text-sm font-normal text-slate-400">{waveDir(data.current.waveDirection)}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Entrada na costa</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold text-slate-400">Próxima Maré Alta</span>
              <p className="text-4xl font-extrabold text-white mt-2">{data.nextTide}</p>
              <p className="text-[11px] text-amber-400 mt-1">Coeficiente: {data.tideCoefficient}</p>
            </div>
          </div>

          {/* Mapa Leaflet de Picos de Surf */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <FaMapMarkerAlt className="w-5 h-5 text-blue-400" />
              Mapa de Picos de Surf — Ilha Comprida
            </h3>
            <p className="text-xs text-slate-400 mb-4">Clique nos marcadores para conferir o nível de dificuldade e dicas dos picos</p>
            <div className="h-[450px] rounded-xl overflow-hidden border border-slate-800">
              <SwellMap />
            </div>
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
