'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FaCloudSun, FaSyncAlt, FaThermometerHalf } from 'react-icons/fa';
import { ChatWidget } from '@/components/ChatWidget';
import { useMeteorology } from '@/hooks/useMeteorology';
import { useAllCities } from '@/hooks/useAllCities';
import { LocationSelector } from './components/LocationSelector';
import { MeteorologyTabs } from './components/MeteorologyTabs';
import { PrevisaoTab } from './components/PrevisaoTab';
import { AvisosTab } from './components/AvisosTab';
import { weatherEmoji } from './components/weather-utils';

const SatelliteTab = dynamic(
  () => import('./components/SatelliteTab').then(mod => ({ default: mod.SatelliteTab })),
  { ssr: false },
);

const NumericaTab = dynamic(
  () => import('./components/NumericaTab').then(mod => ({ default: mod.NumericaTab })),
  { ssr: false },
);

const CITY_ORDER = ['ilha-comprida', 'iguape', 'cananeia', 'registro'] as const;

export default function MeteorologiaPage() {
  const [locationId, setLocationId] = useState('ilha-comprida');
  const { data, loading, error, refetch } = useMeteorology(locationId);
  const { cities, loading: citiesLoading } = useAllCities();

  return (
    <div className="space-y-6">
      {/* Hero Banner — padrão swell */}
      <div
        className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-600/30"
        role="banner"
        aria-label="Cabeçalho da página de meteorologia"
      >
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm" aria-hidden="true">
              <FaCloudSun className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Meteorologia</h1>
              <p className="text-blue-200 text-sm mt-1">Previsão de tempo, satélite e modelos numéricos</p>
            </div>
          </div>

          {/* Mini-cards de temperatura por cidade */}
          <div className="flex flex-wrap items-center gap-3" role="list" aria-label="Temperatura atual das cidades">
            {CITY_ORDER.map(id => {
              const city = cities[id];
              const isActive = locationId === id;
              return (
                <button
                  key={id}
                  onClick={() => setLocationId(id)}
                  role="listitem"
                  aria-label={`${city?.location ?? id}: ${city ? `${Math.round(city.temperature)} graus` : 'carregando'}`}
                  className={`
                    px-4 py-3 rounded-2xl backdrop-blur-sm transition-all duration-200 min-w-[120px]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
                    ${isActive
                      ? 'bg-cyan-500/30 border border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-white/10 border border-white/10 hover:bg-white/20'
                    }
                  `}
                >
                  <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider truncate">
                    {city?.location ?? id.replace(/-/g, ' ')}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {city && <span className="text-lg" aria-hidden="true">{weatherEmoji(city.weatherCode)}</span>}
                    <span className="text-2xl font-extrabold text-white tabular-nums">
                      {citiesLoading ? '--' : city ? `${Math.round(city.temperature)}°` : '--'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-label="Atualizar dados meteorológicos"
        >
          <FaSyncAlt className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span className="text-sm">Atualizar</span>
        </button>
      </div>

      {/* Location Selector — full width grid */}
      <LocationSelector active={locationId} onSelect={setLocationId} />

      {/* Tabs — full width grid */}
      <MeteorologyTabs>
        {activeTab => {
          switch (activeTab) {
            case 'avisos':
              return <AvisosTab />;
            case 'previsao':
              return <PrevisaoTab data={data} loading={loading} onSelectLocation={setLocationId} />;
            case 'satelite':
              return <SatelliteTab />;
            case 'numerica':
              return <NumericaTab />;
            default:
              return <PrevisaoTab data={data} loading={loading} onSelectLocation={setLocationId} />;
          }
        }}
      </MeteorologyTabs>

      {/* Footer */}
      <p className="text-[11px] text-slate-600 text-right" aria-live="polite">
        Última atualização: {data?.timestamp ? new Date(data.timestamp).toLocaleString('pt-BR') : '--'}
      </p>

      <ChatWidget />
    </div>
  );
}
