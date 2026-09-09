'use client';

import { CloudSun, Wind, Droplets, Thermometer, Compass, Loader2 } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';
import dynamic from 'next/dynamic';

const BaseLeafletMap = dynamic(() => import('@/components/maps/BaseLeafletMap').then(mod => mod.BaseLeafletMap), { ssr: false });

export default function MeteorologiaPage() {
  const markers = [
    {
      position: [-24.73, -47.55] as [number, number],
      popupHtml: '<div class="text-xs text-slate-800"><strong>Estação INMET - Ilha Comprida</strong><br />Temp: 26°C | Vento: 18 km/h SE</div>',
      iconHtml: '<div style="width: 28px; height: 28px; background: #0284c7; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">IN</div>'
    },
    {
      position: [-24.49, -47.84] as [number, number],
      popupHtml: '<div class="text-xs text-slate-800"><strong>Estação INMET - Iguape</strong><br />Temp: 25°C | Vento: 15 km/h E</div>',
      iconHtml: '<div style="width: 28px; height: 28px; background: #0284c7; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">IN</div>'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <CloudSun className="w-8 h-8 text-blue-500" />
          Meteorologia & Vento
        </h2>
        <p className="text-slate-400 text-sm mt-1">Previsão detalhada, estações INMET e mapa de ventos na região</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Temperatura Média</span>
            <Thermometer className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">26°C</p>
          <p className="text-[11px] text-slate-500 mt-1">Máxima de 29°C / Mínima de 21°C</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Velocidade do Vento</span>
            <Wind className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">18 <span className="text-sm font-normal text-slate-400">km/h</span></p>
          <p className="text-[11px] text-slate-500 mt-1">Rajadas leves de Sudeste (SE)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Umidade Relativa</span>
            <Droplets className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">78%</p>
          <p className="text-[11px] text-slate-500 mt-1">Ar úmido típico costeiro</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Pressão Atmosférica</span>
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">1014 <span className="text-sm font-normal text-slate-400">hPa</span></p>
          <p className="text-[11px] text-slate-500 mt-1">Estável nas últimas 6h</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-400" />
          Mapa de Estações e Ventos (Ilha Comprida & Vale do Ribeira)
        </h3>
        <div className="h-[450px] rounded-xl overflow-hidden border border-slate-800">
          <BaseLeafletMap center={[-24.73, -47.55]} zoom={10} markers={markers} />
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
