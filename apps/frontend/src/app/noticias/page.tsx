'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaNewspaper, FaExternalLinkAlt, FaCar, FaExclamationTriangle, FaTree, FaSwimmer, FaUsers, FaFilter } from 'react-icons/fa';
import { PageBanner } from '@/components/PageBanner';
import { useRegionalNews, type RegionalNewsItem, type TrafficRoute } from '@/hooks/useRegionalNews';
import { TrafficMap } from './components/TrafficMap';
import { CityGrid } from '../meteorologia/components/CityGrid';

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  todas: { label: 'Todas', emoji: '📰', color: 'text-slate-300', bg: 'bg-slate-800/40' },
  transito: { label: 'Transito', emoji: '🚗', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  noticia: { label: 'Noticias', emoji: '📰', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  policial: { label: 'Policial', emoji: '🚨', color: 'text-red-400', bg: 'bg-red-500/10' },
  turismo: { label: 'Turismo', emoji: '🏖️', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  cotidiano: { label: 'Cotidiano', emoji: '🏠', color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

const ROUTE_CONDITION_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  LIVRE: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  MODERADO: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  LENTO: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  BLOQUEADO: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  OPERACIONAL: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
};

const ROUTE_ICONS: Record<string, string> = {
  'sp-222': '🛣️',
  'sp-055': '🛣️',
  'br-116': '🚛',
  'balsa-cananeia': '⛴️',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atras`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atras`;
  const days = Math.floor(hours / 24);
  return `${days}d atras`;
}

export default function NoticiasPage() {
  const router = useRouter();
  const { data, loading, error } = useRegionalNews();
  const [activeCategory, setActiveCategory] = useState('todas');

  const news = data?.news ?? [];
  const routes = data?.routes ?? [];

  const filtered = activeCategory === 'todas'
    ? news
    : news.filter(n => n.category === activeCategory);

  const categoryCounts = news.reduce((acc, n) => {
    acc[n.category] = (acc[n.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <PageBanner
        title="Noticias do Vale do Ribeira"
        subtitle="Feed unificado de noticias, transito e turismo da regiao"
      />

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Status das Rodovias */}
      <section aria-label="Status das rodovias">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaCar className="w-5 h-5 text-amber-400" aria-hidden="true" />
          Status das Rodovias
        </h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-24 mb-3" />
                <div className="h-6 bg-slate-800 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {routes.map(route => {
              const colors = ROUTE_CONDITION_COLORS[route.condition] ?? ROUTE_CONDITION_COLORS.LIVRE;
              const emoji = ROUTE_ICONS[route.id] ?? '🚗';
              return (
                <div
                  key={route.id}
                  className={`bg-slate-900/80 border ${colors.border} rounded-2xl p-5`}
                  title={`${route.name}: ${route.condition} — ${route.description}`}
                  aria-label={`${route.name}: ${route.condition}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg" aria-hidden="true">{emoji}</span>
                    <span className="text-sm font-bold text-white">{route.name}</span>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {route.condition === 'BLOQUEADO' && <FaExclamationTriangle className="w-3 h-3" aria-hidden="true" />}
                    {route.condition}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">{route.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Mapa de Status das Rodovias */}
      <section aria-label="Mapa de status das rodovias">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaCar className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          Mapa de Rodovias
        </h2>
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" style={{ height: 380 }} />
        ) : (
          <TrafficMap routes={routes} />
        )}
      </section>

      {/* Filtros de Categoria */}
      <section aria-label="Filtros de noticias">
        <div className="flex flex-wrap items-center gap-2">
          <FaFilter className="w-4 h-4 text-slate-500" aria-hidden="true" />
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                activeCategory === key
                  ? `${cfg.bg} ${cfg.color} border-current`
                  : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              {cfg.emoji} {cfg.label}
              {key !== 'todas' && categoryCounts[key] ? (
                <span className="ml-1 text-[10px] opacity-60">({categoryCounts[key]})</span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de Noticias */}
      <section aria-label="Noticias regionais">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-20 mb-3" />
                <div className="h-5 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-full mb-1" />
                <div className="h-3 bg-slate-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => {
              const catCfg = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.noticia;
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${item.title} — ${item.source}`}
                  aria-label={`${item.title}, fonte: ${item.source}`}
                  className="group bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${catCfg.bg} ${catCfg.color} border-current`}>
                      {catCfg.emoji} {catCfg.label}
                    </span>
                    <FaExternalLinkAlt className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-medium">{item.source}</span>
                    <span>{timeAgo(item.publishedAt)}</span>
                  </div>
                </a>
              );
            })}
            {filtered.length === 0 && !loading && (
              <p className="text-sm text-slate-500 col-span-full text-center py-8">
                Nenhuma noticia encontrada nesta categoria.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Notícias Meteorológicas */}
      <CityGrid onSelectLocation={(cityId) => router.push(`/meteorologia?city=${cityId}`)} />

    </div>
  );
}
