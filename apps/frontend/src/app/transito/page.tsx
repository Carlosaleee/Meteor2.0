'use client';

import { Car, AlertCircle, Clock, MapPin } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';
import dynamic from 'next/dynamic';

const TrafficMap = dynamic(() => import('@/components/TrafficMapClient').then(mod => mod.TrafficMapClient), { ssr: false });

export default function TransitoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Car className="w-8 h-8 text-emerald-500" />
          Trânsito & Mobilidade Regional
        </h2>
        <p className="text-slate-400 text-sm mt-1">Monitoramento das rodovias (SP-222, BR-116) e balsas do Vale do Ribeira</p>
      </div>

      {/* Status das Vias Principais */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Rodovia SP-222</span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Livre</span>
          </div>
          <p className="text-xl font-bold text-white">Iguape ⇄ Cananéia</p>
          <p className="text-xs text-slate-400 mt-2">Tráfego fluindo normalmente sem retenções.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Rodovia Régis Bittencourt (BR-116)</span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">Moderado</span>
          </div>
          <p className="text-xl font-bold text-white">Trecho Registro</p>
          <p className="text-xs text-slate-400 mt-2">Fluxo intenso de veículos pesados na serra.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Travessia de Balsa</span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">Operacional</span>
          </div>
          <p className="text-xl font-bold text-white">Cananéia ⇄ Ilha Comprida</p>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Tempo de espera estimado: 15 min
          </p>
        </div>
      </div>

      {/* Mapa Leaflet de Trânsito */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          Mapa de Rodovias e Acessos Regionais
        </h3>
        <div className="h-[450px] rounded-xl overflow-hidden border border-slate-800">
          <TrafficMap />
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
