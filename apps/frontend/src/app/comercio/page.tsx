'use client';

import { useState, useEffect } from 'react';
import { FaStore } from 'react-icons/fa';
import { PageBanner } from '@/components/PageBanner';
import { useComercio } from '@/hooks/useComercio';
import { CommerceGrid } from '@/app/swell/components/CommerceGrid';
import dynamic from 'next/dynamic';
const CommerceMap = dynamic(() => import('./CommerceMap').then(mod => mod.CommerceMap), { ssr: false });
import type { CommerceItem } from '@/lib/api';
import { useDict } from '@/i18n/context';
import { comercio } from '@/i18n/dictionaries/comercio';

export default function ComercioPage() {
  const { data, loading, error } = useComercio();
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
  const t = useDict(comercio);

  return (
    <div className="space-y-8">
      <PageBanner
        title={t['page.title']}
        subtitle={t['page.subtitle']}
      />

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-card border border-card-border rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-card-2" />
            <div className="h-5 bg-card-2 rounded w-48" />
          </div>
          <div className="h-[360px] sm:h-[500px] bg-card-2 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Mapa */}
          <section aria-label={t['map.aria']}>
            <h2 className="text-lg font-bold text-card-text mb-4 flex items-center gap-2">
              <FaStore className="w-5 h-5 text-orange-400" aria-hidden="true" />
              {t['map.title']}
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
          <section aria-label={t['list.aria']}>
            <CommerceGrid
              commerce={commerce}
              onGetDirections={handleSelectCommerce}
            />
          </section>
        </>
      )}

    </div>
  );
}
