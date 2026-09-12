'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FaCloudSun, FaSyncAlt } from 'react-icons/fa';
import { ChatWidget } from '@/components/ChatWidget';
import { PageBanner } from '@/components/PageBanner';
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
    <main className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden" role="main" aria-label="Painel de meteorologia">
      <PageBanner
        title="Meteorologia"
        subtitle="Previsão de tempo, satélite e modelos numéricos"
      />

      {/* Hero Banner */}
      <div
        className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white p-6 md:p-8"
        role="banner"
        aria-label="Cabeçalho da página de meteorologia"
      >
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          {/* Coluna esquerda: Título + Subtítulo + Atualizar */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm" aria-hidden="true">
                <FaCloudSun className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Meteorologia</h1>
            </div>
            <p className="text-blue-200 text-xs ml-[52px]">Previsão de tempo, satélite e modelos numéricos</p>
            <div className="ml-[52px]">
              <button
                onClick={refetch}
                disabled={loading}
                title="Atualizar dados meteorológicos de todas as fontes"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Atualizar dados meteorológicos"
              >
                <FaSyncAlt className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span className="text-xs font-medium">Atualizar</span>
              </button>
            </div>
          </div>

          {/* Coluna direita: Cards de temperatura */}
          <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Temperatura atual das cidades">
            {CITY_ORDER.map(id => {
              const city = cities[id];
              const isActive = locationId === id;
              return (
                <button
                  key={id}
                  onClick={() => setLocationId(id)}
                  role="listitem"
                  title={`${city?.location ?? id}: ${city ? `${Math.round(city.temperature)}°C, ${weatherEmoji(city.weatherCode)}` : 'Carregando...'}`}
                  aria-label={`${city?.location ?? id}: ${city ? `${Math.round(city.temperature)} graus` : 'carregando'}`}
                  className={`
                    px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 min-w-[90px]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                    ${isActive
                      ? 'bg-white/20 border border-white/30'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <p className="text-[9px] font-semibold text-blue-200 uppercase tracking-wider truncate">
                    {city?.location ?? id.replace(/-/g, ' ')}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {city && <span className="text-sm" aria-hidden="true">{weatherEmoji(city.weatherCode)}</span>}
                    <span className="text-lg font-extrabold text-white tabular-nums">
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
        <div className="mx-6 mt-4 bg-red-950/40 border border-red-800/40 rounded-xl p-3 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Location Selector */}
      <div className="px-6 pt-5">
        <LocationSelector active={locationId} onSelect={setLocationId} />
      </div>

      {/* Tabs + Content */}
      <div className="px-6 pb-6 pt-4">
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
      </div>

      {/* Footer info */}
      <div className="px-6 pb-5">
        <p className="text-[10px] text-slate-600 text-right" aria-live="polite">
          Última atualização: {data?.timestamp ? new Date(data.timestamp).toLocaleString('pt-BR') : '--'}
        </p>
      </div>

      <ChatWidget />
    </main>
  );
}
