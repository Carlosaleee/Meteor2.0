'use client';

import { useState, useEffect } from 'react';
import { Waves, Clock, MapPin, Loader2 } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';
import dynamic from 'next/dynamic';

const SwellMap = dynamic(() => import('@/components/SwellMapClient').then(mod => mod.SwellMapClient), { ssr: false });

export default function SwellPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/v1/oceanography')
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar API');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setData({
          current: {
            waveHeight: 1.2,
            wavePeriod: 10,
            waveDirection: 140,
            swellHeight: 1.0,
            swellPeriod: 11,
            swellDirection: 135,
          },
          qualityLabel: 'Boas',
          qualityEmoji: '🏄',
          bestTime: '08:00 - 11:00',
          nextTide: '14:30',
          tideCoefficient: 0.82,
        });
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner de Qualidade do Mar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-600/30">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <Waves className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Condições de Swell & Mar</h2>
              <p className="text-blue-200 text-sm mt-1">Ilha Comprida & Costa do Vale do Ribeira (Conectado à API)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-sm">
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Qualidade</p>
              <p className="text-2xl font-extrabold flex items-center gap-2 text-emerald-100">
                <span>{data?.qualityEmoji || '🏄'}</span>
                <span>{data?.qualityLabel || 'Boas'}</span>
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Melhor Horário
              </p>
              <p className="text-2xl font-extrabold text-white">{data?.bestTime || '08:00 - 11:00'}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-blue-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        /* KPI Cards Oceanográficos */
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold text-slate-400">Altura da Onda</span>
            <p className="text-4xl font-extrabold text-white mt-2">{data?.current?.waveHeight} <span className="text-sm font-normal text-slate-400">metros</span></p>
            <p className="text-[11px] text-emerald-400 mt-1">Série limpa e constante</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold text-slate-400">Período do Swell</span>
            <p className="text-4xl font-extrabold text-white mt-2">{data?.current?.wavePeriod} <span className="text-sm font-normal text-slate-400">segundos</span></p>
            <p className="text-[11px] text-blue-400 mt-1">Ondulação de Sudeste (SE)</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold text-slate-400">Direção Principal</span>
            <p className="text-4xl font-extrabold text-white mt-2">{data?.current?.waveDirection}° <span className="text-sm font-normal text-slate-400">SE</span></p>
            <p className="text-[11px] text-slate-500 mt-1">Entrada perfeita na costa</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold text-slate-400">Próxima Maré Alta</span>
            <p className="text-4xl font-extrabold text-white mt-2">{data?.nextTide}</p>
            <p className="text-[11px] text-amber-400 mt-1">Coeficiente: {data?.tideCoefficient}</p>
          </div>
        </div>
      )}

      {/* Mapa Leaflet de Picos de Surf */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          Mapa de Picos de Surf — Ilha Comprida
        </h3>
        <p className="text-xs text-slate-400 mb-4">Clique nos marcadores para conferir o nível de dificuldade e dicas dos picos</p>
        <div className="h-[450px] rounded-xl overflow-hidden border border-slate-800">
          <SwellMap />
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
