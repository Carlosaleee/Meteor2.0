'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaExternalLinkAlt, FaCar, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import { PageBanner } from '@/components/PageBanner';
import { useRegionalNews } from '@/hooks/useRegionalNews';
import dynamic from 'next/dynamic';
const TrafficMap = dynamic(() => import('./components/TrafficMap').then(mod => mod.TrafficMap), { ssr: false });
import { CityGrid } from '../meteorologia/components/CityGrid';
import { useDict, useI18n } from '@/i18n/context';
import { noticias } from '@/i18n/dictionaries/noticias';
import { fmt } from '@/i18n/format';

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  todas: { label: 'cat.todas', emoji: '📰', color: 'text-card-subtle', bg: 'bg-card-2/40' },
  transito: { label: 'cat.transito', emoji: '🚗', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  noticia: { label: 'cat.noticia', emoji: '📰', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  policial: { label: 'cat.policial', emoji: '🚨', color: 'text-red-400', bg: 'bg-red-500/10' },
  turismo: { label: 'cat.turismo', emoji: '🏖️', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  cotidiano: { label: 'cat.cotidiano', emoji: '🏠', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

const ROUTE_CONDITION_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  LIVRE: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  MODERADO: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  LENTO: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  BLOQUEADO: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  INTERROMPIDO: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  OPERACIONAL: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
};

const ROUTE_ICONS: Record<string, string> = {
  'sp-222': '🛣️',
  'sp-055': '🛣️',
  'sp-165': '🛣️',
  'br-116': '🚛',
  'balsa-cananeia': '⛴️',
};

/** Converte a condição crua vinda da API em rótulo traduzido (fallback: valor cru). */
function condLabel(condition: string, t: Record<string, string>): string {
  return t[`cond.${condition}`] ?? condition;
}

function timeAgo(dateStr: string, t: Record<string, string>): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return fmt(t['time.minutes'], { value: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return fmt(t['time.hours'], { value: hours });
  const days = Math.floor(hours / 24);
  return fmt(t['time.days'], { value: days });
}

/** "21/10 17:48" — data/hora da coleta exibida nos cards de rodovia. */
function formatRouteTime(iso: string, locale = 'pt-BR'): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function NoticiasPage() {
  const router = useRouter();
  const { data, loading, error } = useRegionalNews();
  const [activeCategory, setActiveCategory] = useState('todas');
  const t = useDict(noticias);
  const { lang } = useI18n();
  const locale = lang === 'pt' ? 'pt-BR' : 'es-ES';

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
        title={t['page.title']}
        subtitle={t['page.subtitle']}
      />

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Status das Rodovias */}
      <section id="rodovias" aria-label={t['roads.aria']} className="scroll-mt-20">
        <h2 className="text-lg font-bold text-card-text mb-4 flex items-center gap-2">
          <FaCar className="w-5 h-5 text-amber-400" aria-hidden="true" />
          {t['roads.title']}
        </h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-card border border-card-border rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-card-2 rounded w-24 mb-3" />
                <div className="h-6 bg-card-2 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {routes.map(route => {
              const colors = ROUTE_CONDITION_COLORS[route.condition] ?? ROUTE_CONDITION_COLORS.LIVRE;
              const emoji = ROUTE_ICONS[route.id] ?? '🚗';
              const conditionLabel = condLabel(route.condition, t);
              return (
                <div
                  key={route.id}
                  className={`bg-card/80 border ${colors.border} rounded-2xl p-5`}
                  title={`${route.name}: ${conditionLabel} — ${route.description}`}
                  aria-label={`${route.name}: ${conditionLabel}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg" aria-hidden="true">{emoji}</span>
                    <span className="text-sm font-bold text-card-text">{route.name}</span>
                    {route.source === 'estimated' && (
                      <span
                        className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-semibold bg-card-line/50 text-card-muted border border-card-line/60"
                        title={t['badge.estimatedTitle']}
                      >
                        {t['badge.estimated']}
                      </span>
                    )}
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {route.condition === 'BLOQUEADO' && <FaExclamationTriangle className="w-3 h-3" aria-hidden="true" />}
                    {conditionLabel}
                  </div>
                  <p className="text-[11px] text-card-muted mt-2 truncate" title={route.description}>{route.description}</p>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-card-border/60 text-[10px] text-card-dim">
                    {route.sourceUrl ? (
                      <a
                        href={route.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t['source.verify']}
                        aria-label={fmt(t['source.openAria'], { name: route.name })}
                        className="inline-flex items-center gap-1 hover:text-amber-400 transition-colors"
                      >
                        {t['source.label']} <FaExternalLinkAlt className="w-2.5 h-2.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <span>{t['source.none']}</span>
                    )}
                    <span title={fmt(t['a11y.lastUpdate'], { date: new Date(route.updatedAt).toLocaleString(locale) })}>
                      {formatRouteTime(route.updatedAt, locale)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Mapa de Status das Rodovias */}
      <section aria-label={t['roads.mapAria']}>
        <h2 className="text-lg font-bold text-card-text mb-4 flex items-center gap-2">
          <FaCar className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          {t['roads.mapTitle']}
        </h2>
        {loading ? (
          <div className="bg-card border border-card-border rounded-2xl animate-pulse h-[320px] sm:h-[380px]" />
        ) : (
          <TrafficMap routes={routes} />
        )}
      </section>

      {/* Filtros de Categoria */}
      <section aria-label={t['filters.aria']}>
        <div className="flex flex-wrap items-center gap-2">
          <FaFilter className="w-4 h-4 text-card-dim" aria-hidden="true" />
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const categoryLabel = t[cfg.label];
            const filterAria = fmt(t['filters.apply'], { category: categoryLabel });
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                title={filterAria}
                aria-label={filterAria}
                aria-pressed={activeCategory === key}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                  activeCategory === key
                    ? `${cfg.bg} ${cfg.color} border-current`
                    : 'bg-card-2/40 text-card-muted border-card-line/50 hover:bg-card-2'
                }`}
              >
                {cfg.emoji} {categoryLabel}
                {key !== 'todas' && categoryCounts[key] ? (
                  <span className="ml-1 text-[10px] opacity-60">({categoryCounts[key]})</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid de Noticias */}
      <section aria-label={t['news.aria']}>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border border-card-border rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-card-2 rounded w-20 mb-3" />
                <div className="h-5 bg-card-2 rounded w-3/4 mb-2" />
                <div className="h-3 bg-card-2 rounded w-full mb-1" />
                <div className="h-3 bg-card-2 rounded w-2/3" />
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
                  aria-label={fmt(t['a11y.newsLink'], { title: item.title, source: item.source })}
                  className="group bg-card/80 border border-card-border rounded-2xl p-5 hover:border-blue-500/30 hover:bg-card-2/60 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${catCfg.bg} ${catCfg.color} border-current`}>
                      {catCfg.emoji} {t[catCfg.label]}
                    </span>
                    <FaExternalLinkAlt className="w-3 h-3 text-card-faint group-hover:text-blue-400 transition-colors" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold text-card-text group-hover:text-blue-300 transition-colors mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-card-muted leading-relaxed mb-3 line-clamp-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-card-dim">
                    <span className="font-medium">{item.source}</span>
                    <span>{timeAgo(item.publishedAt, t)}</span>
                  </div>
                </a>
              );
            })}
            {filtered.length === 0 && !loading && (
              <p className="text-sm text-card-dim col-span-full text-center py-8">
                {t['empty.news']}
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
