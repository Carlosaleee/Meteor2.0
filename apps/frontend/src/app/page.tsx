'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaCloudSun,
  FaWater,
  FaCar,
  FaNewspaper,
  FaStore,
  FaBookOpen,
  FaExternalLinkAlt,
  FaArrowRight,
  FaMapMarkerAlt,
  FaRoute,
} from 'react-icons/fa';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ForecastSection } from '@/app/swell/components/ForecastSection';
import { ConditionCards } from '@/app/swell/components/ConditionCards';
import { useDict, useI18n } from '@/i18n/context';
import { home } from '@/i18n/dictionaries/home';
import { fmt } from '@/i18n/format';
import { useAllCities } from '@/hooks/useAllCities';
import { useSwell } from '@/hooks/useSwell';
import { useRegionalNews } from '@/hooks/useRegionalNews';
import { useNews } from '@/hooks/useNews';
import { useComercio } from '@/hooks/useComercio';
import { FALLBACK_IMAGES } from '@/lib/fallback-images';
import { publishedPosts } from '@/data/blog-posts';
import { SPOTS, LEVEL_CONFIG } from '@/lib/spots-data';
import { weatherEmoji } from '@/app/meteorologia/components/weather-utils';

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

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  transito: { label: 'cat.transito', emoji: '🚗', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  noticia: { label: 'cat.noticia', emoji: '📰', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  policial: { label: 'cat.policial', emoji: '🚨', color: 'text-red-400', bg: 'bg-red-500/10' },
  turismo: { label: 'cat.turismo', emoji: '🏖️', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  cotidiano: { label: 'cat.cotidiano', emoji: '🏠', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

const SECTOR_ICONS: Record<string, string> = {
  alimentacao: '🍔',
  hospedagem: '🏨',
  servicos: '🔧',
  comercio: '🛒',
  lazer: '🎭',
  saude: '🏥',
  educacao: '📚',
  automotivo: '🚗',
};

const CTA_TONES: Record<string, string> = {
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 focus-visible:ring-amber-400',
  blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 focus-visible:ring-blue-400',
  cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 focus-visible:ring-cyan-400',
  orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 focus-visible:ring-orange-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 focus-visible:ring-emerald-400',
};

function SectionCta({ href, tone, children }: { href: string; tone: keyof typeof CTA_TONES; children: string }) {
  return (
    <Link
      href={href}
      title={children}
      aria-label={children}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${CTA_TONES[tone]}`}
    >
      {children}
      <FaArrowRight className="w-3 h-3" aria-hidden="true" />
    </Link>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatRouteTime(iso: string, locale: string = 'pt-BR'): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function EstimatedBadge() {
  const t = useDict(home);
  return (
    <span
      className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-semibold bg-card-line/50 text-card-muted border border-card-line/50"
      title={t['badge.estimatedTitle']}
    >
      {t['badge.estimated']}
    </span>
  );
}

export default function HomePage() {
  const t = useDict(home);
  const { lang } = useI18n();
  const locale = lang === 'pt' ? 'pt-BR' : 'es-ES';
  const { cities, loading: citiesLoading } = useAllCities();
  const { data: swellData, loading: swellLoading } = useSwell();
  const { data: newsData, loading: newsLoading } = useRegionalNews();
  const { data: surfNewsData, loading: surfNewsLoading } = useNews();
  const { data: comercioData, loading: comercioLoading } = useComercio();

  const [newsCategory, setNewsCategory] = useState('todas');
  const [sportTab, setSportTab] = useState<'todas' | 'WSL' | 'Paulista'>('todas');

  const latestNews = newsData?.news?.slice(0, 6) ?? [];
  const routes = newsData?.routes ?? [];
  const commerce = comercioData?.commerce?.slice(0, 6) ?? [];
  const topSpots = SPOTS.slice(0, 4);

  const filteredNews = newsCategory === 'todas'
    ? latestNews
    : latestNews.filter(n => n.category === newsCategory);

  // 3 da WSL + 3 da SPSurf (Circuito Paulista)
  const allSurfNews = surfNewsData?.news ?? [];
  const wslNews = allSurfNews.filter(n => n.category === 'WSL').slice(0, 3);
  const paulistaNews = allSurfNews.filter(n => n.category === 'Paulista').slice(0, 3);

  const displayedSportNews = sportTab === 'todas'
    ? [...wslNews, ...paulistaNews]
    : sportTab === 'WSL'
      ? wslNews
      : paulistaNews;

  return (
    <main className="space-y-8" role="main" aria-label={t['main.aria']}>
      <h1 className="sr-only">{t['main.h1']}</h1>

      <a href="#conteudo" className="skip-link sr-only" title={t['skip.content']} aria-label={t['skip.content']}>
        {t['skip.content']}
      </a>

      <nav aria-label={t['skip.aria']} className="sr-only focus-within:not-sr-only">
        <a href="#conteudo" className="block p-2 bg-card-line text-card-text rounded-lg" title={t['skip.content']} aria-label={t['skip.content']}>{t['skip.content']}</a>
        <a href="#tempo" className="block p-2 bg-amber-700 text-white rounded-lg" title={t['skip.weather']} aria-label={t['skip.weather']}>{t['skip.weather']}</a>
        <a href="#rodovias" className="block p-2 bg-amber-700 text-white rounded-lg" title={t['skip.traffic']} aria-label={t['skip.traffic']}>{t['skip.traffic']}</a>
        <a href="#noticias" className="block p-2 bg-blue-700 text-white rounded-lg" title={t['skip.news']} aria-label={t['skip.news']}>{t['skip.news']}</a>
        <a href="#mar" className="block p-2 bg-cyan-700 text-white rounded-lg" title={t['skip.sea']} aria-label={t['skip.sea']}>{t['skip.sea']}</a>
        <a href="#surf-news" className="block p-2 bg-amber-700 text-white rounded-lg" title={t['skip.sport']} aria-label={t['skip.sport']}>{t['skip.sport']}</a>
        <a href="#blog" className="block p-2 bg-emerald-700 text-white rounded-lg" title={t['skip.blog']} aria-label={t['skip.blog']}>{t['skip.blog']}</a>
        <a href="#comercio" className="block p-2 bg-orange-700 text-white rounded-lg" title={t['skip.comercio']} aria-label={t['skip.comercio']}>{t['skip.comercio']}</a>
        <a href="#points" className="block p-2 bg-blue-700 text-white rounded-lg" title={t['skip.points']} aria-label={t['skip.points']}>{t['skip.points']}</a>
      </nav>

      {/* 1. Hero Carousel do Topo */}
      <HeroCarousel />

      <div id="conteudo" tabIndex={-1} className="space-y-8 outline-none">
        {/* 2. Previsão do Tempo — 4 cidades */}
        <ForecastSection
          id="tempo"
          title={t['section.weather']}
          icon={<FaCloudSun className="w-5 h-5 text-amber-400" aria-hidden="true" />}
          ariaLabel={t['aria.weather']}
          ariaBusy={citiesLoading}
          action={<SectionCta href="/meteorologia" tone="amber">{t['cta.weather']}</SectionCta>}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="list" aria-label={t['aria.cityList']}>
            {(['ilha-comprida', 'iguape', 'cananeia', 'registro'] as const).map(id => {
              const city = cities[id];
              const maxMin = city?.tempMax != null && city?.tempMin != null
                ? fmt(t['city.maxMin'], { max: Math.round(city.tempMax), min: Math.round(city.tempMin) })
                : null;
              return (
                <div key={id} role="listitem">
                  <Link
                    href={`/meteorologia?city=${id}`}
                    className="block bg-card/80 border border-card-border rounded-2xl p-3 hover:border-amber-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    title={`${city?.location ?? id}: ${city ? `${Math.round(city.temperature)}°C` : t['loading']}`}
                    aria-label={`${city?.location ?? id}: ${city ? `${Math.round(city.temperature)} graus, ${weatherEmoji(city.weatherCode)}${maxMin ? `. ${maxMin}` : ''}` : t['loadingLower']}`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-card-muted mb-1 truncate">
                      {city?.location ?? id.replace(/-/g, ' ')}
                    </p>
                    <div className="flex items-center gap-2">
                      {city && <span className="text-xl" aria-hidden="true">{weatherEmoji(city.weatherCode)}</span>}
                      <span className="text-2xl font-extrabold text-card-text tabular-nums">
                        {citiesLoading ? '--' : city ? `${Math.round(city.temperature)}°` : '--'}
                      </span>
                    </div>
                    {city?.tempMax != null && city?.tempMin != null && (
                      <p className="text-[10px] text-amber-400/90 font-medium mt-1 tabular-nums">
                        ▲ {Math.round(city.tempMax)}° · ▼ {Math.round(city.tempMin)}°
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-card-muted">
                      {city && (
                        <>
                          <span>💧 {city.humidity}%</span>
                          <span>💨 {Math.round(city.windSpeed)} km/h</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </ForecastSection>

        {/* 3. Trânsito / Status das Rodovias */}
        <ForecastSection
          id="rodovias"
          title={t['section.traffic']}
          icon={<FaCar className="w-5 h-5 text-amber-400" aria-hidden="true" />}
          ariaLabel={t['aria.traffic']}
          ariaBusy={newsLoading}
          action={<SectionCta href="/noticias#rodovias" tone="amber">{t['cta.traffic']}</SectionCta>}
        >
          {newsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3" aria-busy="true">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-card border border-card-border rounded-2xl p-3 animate-pulse">
                  <div className="h-4 bg-card-2 rounded w-24 mb-3" />
                  <div className="h-6 bg-card-2 rounded w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {routes.map(route => {
                const colors = ROUTE_CONDITION_COLORS[route.condition] ?? ROUTE_CONDITION_COLORS.LIVRE;
                const emoji = ROUTE_ICONS[route.id] ?? '🚗';
                return (
                  <Link
                    key={route.id}
                    href={route.sourceUrl || '/noticias'}
                    target={route.sourceUrl ? '_blank' : undefined}
                    rel={route.sourceUrl ? 'noopener noreferrer' : undefined}
                    className={`bg-card/80 border ${colors.border} rounded-2xl p-3 hover:scale-[1.02] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-card-text)]`}
                    title={`${route.name}: ${route.condition} — ${route.description}`}
                    aria-label={`${route.name}: ${route.condition} — ${t['a11y.route.open']}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg" aria-hidden="true">{emoji}</span>
                      <span className="text-sm font-bold text-card-text">{route.name}</span>
                      {route.source === 'estimated' && <EstimatedBadge />}
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {route.condition}
                    </div>
                    <p className="text-[11px] text-card-muted mt-2 truncate" title={route.description}>{route.description}</p>
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-card-border/60 text-[10px] text-card-muted">
                      <span className="inline-flex items-center gap-1">
                        {route.sourceUrl ? (
                          <>{t['source.label']} <FaExternalLinkAlt className="w-2.5 h-2.5" aria-hidden="true" /></>
                        ) : (
                          t['source.none']
                        )}
                      </span>
                      <span title={fmt(t['source.lastUpdate'], { date: new Date(route.updatedAt).toLocaleString(locale) })}>
                        {formatRouteTime(route.updatedAt, locale)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </ForecastSection>

        {/* 4. Últimas Notícias Regionais */}
        <ForecastSection
          id="noticias"
          title={t['section.news']}
          icon={<FaNewspaper className="w-5 h-5 text-blue-400" aria-hidden="true" />}
          ariaLabel={t['aria.news']}
          ariaBusy={newsLoading}
          action={<SectionCta href="/noticias" tone="blue">{t['cta.viewAll']}</SectionCta>}
        >
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label={t['aria.newsFilter']}>
            {['todas', ...Object.keys(CATEGORY_CONFIG)].map(key => {
              const cfg = key === 'todas' ? { label: 'cat.todas', emoji: '📰', color: 'text-card-subtle', bg: 'bg-card-2/40' } : CATEGORY_CONFIG[key];
              return (
                <button
                  key={key}
                  onClick={() => setNewsCategory(key)}
                  aria-pressed={newsCategory === key}
                  title={t[cfg.label]}
                  aria-label={t[cfg.label]}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    newsCategory === key
                      ? `${cfg.bg} ${cfg.color} border-current`
                      : 'bg-card-2/40 text-card-muted border-card-line/50 hover:bg-card-2'
                  }`}
                >
                  {cfg.emoji} {t[cfg.label]}
                </button>
              );
            })}
          </div>

          {newsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-busy="true">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card border border-card-border rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-card-2 rounded w-20 mb-3" />
                  <div className="h-5 bg-card-2 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-card-2 rounded w-full mb-1" />
                  <div className="h-3 bg-card-2 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNews.map(item => {
                const catCfg = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.noticia;
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${item.title} — ${item.source}`}
                    aria-label={`${item.title}, ${t['a11y.news.source']}: ${item.source}`}
                    className="group bg-card/80 border border-card-border rounded-2xl p-4 hover:border-blue-500/30 hover:bg-card-2/60 transition-all overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${catCfg.bg} ${catCfg.color} border-current`}>
                        {catCfg.emoji} {catCfg.label}
                      </span>
                      <FaExternalLinkAlt className="w-3 h-3 text-card-muted group-hover:text-blue-400 transition-colors" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold text-card-text group-hover:text-blue-300 transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-card-muted leading-relaxed mb-3 max-h-8 group-hover:max-h-40 overflow-hidden transition-all duration-300 ease-in-out">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-card-muted">
                      <span className="font-medium">{item.source}</span>
                      <span>{timeAgo(item.publishedAt)}</span>
                    </div>
                  </a>
                );
              })}
              {filteredNews.length === 0 && (
                <p className="text-sm text-card-muted col-span-full text-center py-8">
                  {t['empty.news']}
                </p>
              )}
            </div>
          )}
        </ForecastSection>

        {/* 5. Condições do Mar */}
        <ForecastSection
          id="mar"
          title={t['section.sea']}
          icon={<FaWater className="w-5 h-5 text-cyan-400" aria-hidden="true" />}
          ariaLabel={t['aria.sea']}
          ariaBusy={swellLoading}
          action={<SectionCta href="/swell?tab=overview" tone="cyan">{t['cta.sea']}</SectionCta>}
        >
          {swellLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2" aria-busy="true">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card-2/60 border border-card-line/50 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-card-line" />
                  <div className="h-5 bg-card-line rounded w-12" />
                  <div className="h-3 bg-card-line rounded w-16" />
                </div>
              ))}
            </div>
          ) : swellData ? (
            <ConditionCards
              waveHeight={swellData.current.waveHeight}
              wavePeriod={swellData.current.wavePeriod}
              waveDirection={swellData.current.waveDirection}
              swellHeight={swellData.current.swellHeight}
              qualityLabel={swellData.qualityLabel}
              qualityEmoji={swellData.qualityEmoji}
            />
          ) : (
            <div className="bg-card/80 border border-card-border rounded-2xl p-4 text-center text-card-muted">
              {t['empty.sea']}
            </div>
          )}
        </ForecastSection>

        {/* 6. Esporte (WSL e Circuito Paulista — 6 notícias com abas) */}
        <ForecastSection
          id="surf-news"
          title={t['section.sport']}
          icon={<FaWater className="w-5 h-5 text-amber-400" aria-hidden="true" />}
          ariaLabel={t['aria.sport']}
          ariaBusy={surfNewsLoading}
          action={<SectionCta href="/swell?tab=news" tone="blue">{t['cta.viewAll']}</SectionCta>}
        >
          {/* Subfiltros em abas: Todas / WSL / Circuito Paulista */}
          <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label={t['aria.sportFilter']}>
            {(
              [
                { id: 'todas', label: 'sport.todas' },
                { id: 'WSL', label: 'sport.wsl' },
                { id: 'Paulista', label: 'sport.paulista' },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={sportTab === tab.id}
                onClick={() => setSportTab(tab.id)}
                title={t[tab.label]}
                aria-label={t[tab.label]}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  sportTab === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-card-2/40 text-card-muted border-card-line/50 hover:bg-card-2'
                }`}
              >
                {t[tab.label]}
              </button>
            ))}
          </div>

          {surfNewsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-busy="true">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card border border-card-border rounded-2xl p-4 animate-pulse">
                  <div className="h-32 bg-card-2 rounded mb-3" />
                  <div className="h-4 bg-card-2 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-card-2 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
              {displayedSportNews.map(item => (
                <div key={item.id} role="listitem">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${item.title} — ${item.source} ${t['a11y.news.openTab']}`}
                    aria-label={`${item.title}, ${t['a11y.news.source']}: ${item.source}`}
                    className="group block rounded-xl overflow-hidden bg-card-2/40 border border-card-line/50 hover:bg-card-2/80 hover:border-blue-500/30 transition-all h-full flex flex-col"
                  >
                    <div className="h-40 bg-card-2 overflow-hidden relative shrink-0">
                      <img
                        src={item.image || FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES.WSL}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES.WSL;
                        }}
                      />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-medium border ${item.category === 'WSL' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                        {item.category === 'WSL' ? 'WSL' : 'SPSurf'}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-bold text-card-text group-hover:text-blue-300 transition-colors line-clamp-2">{item.title}</h3>
                          <FaExternalLinkAlt className="w-3 h-3 text-card-muted group-hover:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                        </div>
                        <p className="text-[10px] text-blue-400 font-medium mb-1">{item.source}</p>
                        <p className="text-xs text-card-muted leading-relaxed line-clamp-2">{item.description}</p>
                      </div>
                      <p className="text-[9px] text-card-muted mt-3 font-mono">
                        {new Date(item.publishedAt).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </a>
                </div>
              ))}
              {(!displayedSportNews.length && !surfNewsLoading) && (
                <p className="col-span-full text-center py-8 text-card-muted text-sm">
                  {t['empty.sport']}
                </p>
              )}
            </div>
          )}
        </ForecastSection>

        {/* 7. Blog */}
        <ForecastSection
          id="blog"
          title={t['section.blog']}
          icon={<FaBookOpen className="w-5 h-5 text-emerald-400" aria-hidden="true" />}
          ariaLabel={t['aria.blog']}
          action={<SectionCta href="/blog" tone="emerald">{t['cta.blog']}</SectionCta>}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {publishedPosts().slice(0, 8).map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                title={post.title}
                aria-label={`${t['a11y.blog.open']}: ${post.title}`}
                className="group bg-card border border-card-border hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <div className="relative h-24 overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt={post.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent" />
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{post.category}</span>
                  <h3 className="text-sm font-bold text-card-text mt-1 group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </ForecastSection>

        {/* 8. Comércio em Destaque */}
        <ForecastSection
          id="comercio"
          title={t['section.comercio']}
          icon={<FaStore className="w-5 h-5 text-orange-400" aria-hidden="true" />}
          ariaLabel={t['aria.comercio']}
          ariaBusy={comercioLoading}
          action={<SectionCta href="/comercio" tone="orange">{t['cta.comercio']}</SectionCta>}
        >
          {comercioLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-busy="true">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card border border-card-border rounded-2xl p-3 animate-pulse">
                  <div className="h-4 bg-card-2 rounded w-20 mb-3" />
                  <div className="h-5 bg-card-2 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-card-2 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {commerce.map(item => (
                <a
                  key={item.id}
                  href={item.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${item.name} — ${item.sector}`}
                  aria-label={`${item.name}, ${t['a11y.commerce.sector']}: ${item.sector}`}
                  className="group bg-card/80 border border-card-border rounded-2xl p-3 hover:border-orange-500/30 hover:bg-card-2/60 transition-all overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl" aria-hidden="true">{SECTOR_ICONS[item.sector] ?? '🏪'}</span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-card-text group-hover:text-orange-300 transition-colors truncate">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-orange-400 font-medium">{item.sector}</span>
                    </div>
                  </div>
                  <p className="text-xs text-card-muted max-h-8 group-hover:max-h-40 overflow-hidden transition-all duration-300 ease-in-out mb-2">{item.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-card-muted">
                    <span className="truncate">{item.address}</span>
                    <FaExternalLinkAlt className="w-3 h-3 text-card-muted group-hover:text-orange-400 transition-colors flex-shrink-0" aria-hidden="true" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </ForecastSection>

        {/* 9. Points de Surf (4 Cards com nível, melhor vento e GPS) */}
        <ForecastSection
          id="points"
          title={t['section.points']}
          icon={<FaMapMarkerAlt className="w-5 h-5 text-blue-400" aria-hidden="true" />}
          ariaLabel={t['aria.points']}
          action={<SectionCta href="/swell?tab=spots" tone="blue">{t['cta.points']}</SectionCta>}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topSpots.map(spot => {
              const levelCfg = LEVEL_CONFIG[spot.level];
              return (
                <div
                  key={spot.id}
                  className="bg-card/80 border border-card-border hover:border-blue-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${levelCfg.bg} ${levelCfg.color} ${levelCfg.border}`}>
                        {levelCfg.emoji} {levelCfg.label}
                      </span>
                      <span className="text-[10px] text-card-muted font-mono">
                        {spot.lat.toFixed(2)}°, {spot.lon.toFixed(2)}°
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-card-text mb-1">{spot.name}</h3>
                    <p className="text-xs text-card-muted line-clamp-2 mb-3 leading-relaxed">
                      {spot.description}
                    </p>
                    <div className="space-y-1 text-[11px] text-card-muted mb-3 bg-card-2/40 p-2.5 rounded-xl border border-card-border/60">
                      <div className="flex items-center justify-between">
                        <span className="text-card-muted">{t['points.bestWind']}</span>
                        <span className="font-semibold text-card-text">{spot.bestWind}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-card-muted">{t['points.exposure']}</span>
                        <span className="text-card-subtle truncate max-w-[120px]">{spot.exposure}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-card-border/60">
                    <Link
                      href="/swell?tab=spots"
                      title={t['cta.map']}
                      aria-label={t['cta.map']}
                      className="flex-1 text-center py-1.5 px-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      {t['cta.map']}
                    </Link>
                    <a
                      href={spot.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={fmt(t['a11y.spot.maps'], { name: spot.name })}
                      aria-label={fmt(t['a11y.spot.maps'], { name: spot.name })}
                      className="p-2 bg-card-2/60 hover:bg-card-line/60 text-card-subtle hover:text-card-text rounded-lg border border-card-line/50 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-card-text)]"
                    >
                      <FaRoute className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </ForecastSection>

        {/* 10. Carrossel Compacto Pré-Footer */}
        <section aria-label={t['aria.compact']} className="pt-4">
          <HeroCarousel compact={true} />
        </section>
      </div>
    </main>
  );
}
