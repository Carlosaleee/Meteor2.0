'use client';

import dynamic from 'next/dynamic';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { PageBanner } from '@/components/PageBanner';

const SpotMap = dynamic(() => import('@/components/organisms/SpotMap').then(mod => mod.SpotMap), { ssr: false });

export default function MapaPage() {
  return (
    <div className="space-y-8">
      <PageBanner title="Mapa — Vale do Ribeira" subtitle="Leaflet OSM — 6 localidades monitoradas na região" />

      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <FaMapMarkerAlt className="w-8 h-8 text-blue-500" />
          Mapa — Vale do Ribeira
        </h2>
        <p className="text-slate-400 text-sm mt-1">Leaflet OSM — 6 localidades monitoradas na região</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMapMarkerAlt className="w-5 h-5 text-blue-400" />
          Mapa de Localizações — Ilha Comprida & Vale do Ribeira
        </h3>
        <div className="h-[450px] rounded-xl overflow-hidden border border-slate-800">
          <SpotMap />
        </div>
      </div>

    </div>
  );
}
