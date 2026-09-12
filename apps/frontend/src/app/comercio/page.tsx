'use client';

import { useState, useEffect } from 'react';
import { FaStore } from 'react-icons/fa';
import { ChatWidget } from '@/components/ChatWidget';
import { PageBanner } from '@/components/PageBanner';
import { useLocalismo } from '@/hooks/useLocalismo';
import { CommerceGrid } from '@/app/swell/components/CommerceGrid';
import { CommerceMap } from './CommerceMap';
import type { CommerceItem } from '@/lib/api';

export default function ComercioPage() {
  const { data, loading, error } = useLocalismo();
  const [selectedCommerce, setSelectedCommerce] = useState<CommerceItem | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => setUserPosition(null),
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, []);

  const handleSelectCommerce = (item: CommerceItem) => {
    setSelectedCommerce(prev => prev?.id === item.id ? null : item);
  };

  const handleClearRoute = () => {
    setSelectedCommerce(null);
  };

  const commerce = data?.commerce ?? [];

  return (
    <div className="space-y-8">
      <PageBanner
        title="Comercio de Ilha Comprida"
        subtitle="Directorio completo de estabelecimentos comerciais da regiao"
      />

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800" />
            <div className="h-5 bg-slate-800 rounded w-48" />
          </div>
          <div className="h-[500px] bg-slate-800 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Mapa */}
          <section aria-label="Mapa de comercios">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaStore className="w-5 h-5 text-orange-400" aria-hidden="true" />
              Mapa de Comercios
            </h2>
            <CommerceMap
              commerce={commerce}
              selectedCommerce={selectedCommerce}
              userPosition={userPosition}
              onSelectCommerce={handleSelectCommerce}
              onClearRoute={handleClearRoute}
            />
          </section>

          {/* Grid */}
          <section aria-label="Lista de comercios">
            <CommerceGrid
              commerce={commerce}
              onGetDirections={handleSelectCommerce}
            />
          </section>
        </>
      )}

      <ChatWidget />
    </div>
  );
}
