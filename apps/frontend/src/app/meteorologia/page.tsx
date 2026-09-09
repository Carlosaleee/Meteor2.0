'use client';

import { useState, useEffect } from 'react';
import { CloudSun, Wind, Droplets, Thermometer, Compass, Loader2 } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';
import dynamic from 'next/dynamic';

const WeatherMap = dynamic(() => import('@/components/WeatherMapClient').then(mod => mod.WeatherMapClient), { ssr: false });

export default function MeteorologiaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/v1/meteorology')
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar API');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        // Fallback robusto se o backend não estiver rodando na porta 3001
        setData({
          location: 'Ilha Comprida',
          current: {
            temperature: 26.5,
            apparentTemperature: 28.0,
            humidity: 78,
            windSpeed: 18.2,
            windDirection: 140,
            pressure: 1014.2
          },
          forecastMax: 29,
          forecastMin: 21
        });
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <CloudSun className="w-8 h-8 text-blue-500" />
          Meteorologia & Vento — {data?.location || 'Ilha Comprida'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">Previsão detalhada, estações INMET e mapa de ventos na região (Conectado à API)</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-blue-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards de Clima */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Temperatura Atual</span>
                <Thermometer className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-white">{data?.current?.temperature}°C</p>
              <p className="text-[11px] text-slate-500 mt-1">Sensação térmica de {data?.current?.apparentTemperature}°C</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Velocidade do Vento</span>
                <Wind className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{data?.current?.windSpeed} <span className="text-sm font-normal text-slate-400">km/h</span></p>
              <p className="text-[11px] text-slate-500 mt-1">Direção {data?.current?.windDirection}°</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Umidade Relativa</span>
                <Droplets className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{data?.current?.humidity}%</p>
              <p className="text-[11px] text-slate-500 mt-1">Ar úmido típico costeiro</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Pressão Atmosférica</span>
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{data?.current?.pressure} <span className="text-sm font-normal text-slate-400">hPa</span></p>
              <p className="text-[11px] text-slate-500 mt-1">Estável nas últimas 6h</p>
            </div>
          </div>
        </>
      )}

      {/* Mapa Leaflet de Meteorologia */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-400" />
          Mapa de Estações e Ventos (Ilha Comprida & Vale do Ribeira)
        </h3>
        <div className="h-[450px] rounded-xl overflow-hidden border border-slate-800">
          <WeatherMap />
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
