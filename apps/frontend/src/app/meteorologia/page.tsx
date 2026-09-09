'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FaCloudSun, FaWind, FaTint, FaThermometerHalf, FaCompass, FaMapMarkerAlt, FaSyncAlt } from 'react-icons/fa';
import { ChatWidget } from '@/components/ChatWidget';
import { useMeteorology } from '@/hooks/useMeteorology';

const WeatherMap = dynamic(() => import('@/components/WeatherMapClient').then(mod => mod.WeatherMapClient), { ssr: false });

const LOCATIONS = [
  { id: 'ilha-comprida', name: 'Ilha Comprida' },
  { id: 'iguape', name: 'Iguape' },
  { id: 'cananeia', name: 'Cananéia' },
  { id: 'registro', name: 'Registro' },
];

function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

export default function MeteorologiaPage() {
  const [locationId, setLocationId] = useState('ilha-comprida');
  const { data, loading, error, refetch } = useMeteorology(locationId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <FaCloudSun className="w-8 h-8 text-blue-500" />
            Meteorologia & Vento
          </h2>
          <p className="text-slate-400 text-sm mt-1">Previsão detalhada, estações INMET e mapa de ventos na região</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={locationId}
            onChange={e => setLocationId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500 transition-colors disabled:opacity-50"
            title="Atualizar dados"
          >
            <FaSyncAlt className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg animate-pulse">
              <div className="h-3 bg-slate-800 rounded w-20 mb-3" />
              <div className="h-8 bg-slate-800 rounded w-16 mb-2" />
              <div className="h-2 bg-slate-800 rounded w-32" />
            </div>
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Temperatura</span>
                <FaThermometerHalf className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-white">{data.current.temperature}°C</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Sensação: {data.current.apparentTemperature}°C · Máx {data.forecastMax}° / Mín {data.forecastMin}°
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Velocidade do Vento</span>
                <FaWind className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">
                {data.current.windSpeed} <span className="text-sm font-normal text-slate-400">km/h</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Direção: {windDirection(data.current.windDirection)} ({data.current.windDirection}°)
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Umidade Relativa</span>
                <FaTint className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{data.current.humidity}%</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Chuva: {data.current.precipitation} mm
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Pressão Atmosférica</span>
                <FaCompass className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">
                {data.current.pressure} <span className="text-sm font-normal text-slate-400">hPa</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                <FaMapMarkerAlt className="w-3 h-3 inline mr-1" />
                {data.location}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCompass className="w-5 h-5 text-blue-400" />
              Mapa de Estações e Ventos — {data.location}
            </h3>
            <div className="h-[450px] rounded-xl overflow-hidden border border-slate-800">
              <WeatherMap />
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
