'use client';

import { Waves, Clock, MapPin } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';
import { SwellMapClient } from '@/components/SwellMapClient';

export default function SwellPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-600/30">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <Waves className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Condições de Swell &amp; Mar</h2>
              <p className="text-blue-200 text-sm mt-1">Ilha Comprida &amp; Costa do Vale do Ribeira</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-sm">
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Qualidade</p>
              <p className="text-2xl font-extrabold flex items-center gap-2 text-emerald-100"><span>🏄</span> Boas</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Melhor Horário</p>
              <p className="text-2xl font-extrabold text-white">08:00 - 11:00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Altura da Onda</span>
          <p className="text-4xl font-extrabold text-white mt-2">1.2 <span className="text-sm font-normal text-slate-400">metros</span></p>
          <p className="text-[11px] text-emerald-400 mt-1">Série limpa e constante</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Período do Swell</span>
          <p className="text-4xl font-extrabold text-white mt-2">10 <span className="text-sm font-normal text-slate-400">segundos</span></p>
          <p className="text-[11px] text-blue-400 mt-1">Ondulação de Sudeste (SE)</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Direção Principal</span>
          <p className="text-4xl font-extrabold text-white mt-2">140° <span className="text-sm font-normal text-slate-400">SE</span></p>
          <p className="text-[11px] text-slate-500 mt-1">Entrada perfeita na costa</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Próxima Maré Alta</span>
          <p className="text-4xl font-extrabold text-white mt-2">14:30</p>
          <p className="text-[11px] text-amber-400 mt-1">Coeficiente: 0.8</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          Mapa de Picos de Surf — Ilha Comprida
        </h3>
        <p className="text-xs text-slate-400 mb-4">Clique nas marcas</p>
        <SwellMapClient />
        <div className="h-[450px] rounded-xl overflow-hidden border" />
      </div>

      <ChatWidget />
    </div>
  );
}
