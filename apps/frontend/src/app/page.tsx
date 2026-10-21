'use client';

import { useState } from 'react';
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
} from 'react-icons/fa';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ForecastSection } from '@/app/swell/components/ForecastSection';
import { ResumoIA } from '@/app/swell/components/ResumoIA';
import { ConditionCards } from '@/app/swell/components/ConditionCards';
import { useAllCities } from '@/hooks/useAllCities';
import { useSwell } from '@/hooks/useSwell';
import { useAiSummary } from '@/hooks/useAiSummary';
import { useRegionalNews } from '@/hooks/useRegionalNews';
import { useNews } from '@/hooks/useNews';
import { useComercio } from '@/hooks/useComercio';
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
  transito: { label: 'Trânsito', emoji: '🚗', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  noticia: { label: 'Notícia', emoji: '📰', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  policial: { label: 'Policial', emoji: '🚨', color: 'text-red-400', bg: 'bg-red-500/10' },
  turismo: { label: 'Turismo', emoji: '🏖️', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  cotidiano: { label: 'Cotidiano', emoji: '🏠', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

const SECTOR_ICONS: Record<string, string> = {
  Alimentação: '🍔',
  Hospedagem: '🏨',
  Serviços: '🔧',
  Comércio: '🛒',
  Lazer: '🎭',
  Saúde: '🏥',
  Educação: '📚',
  Automotivo: '🚗',
};

/** CTA padrao do header de cada secao — uma secao por aba do portal. */
const CTA_TONES: Record<string, string> = {
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 focus-visible:ring-amber-400',
  blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 focus-visible:ring-blue-400',
  cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 focus-visible:ring-cyan-400',
  orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 focus-visible:ring-orange-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 focus-visible:ring-emerald-400',
};

function SectionCta({ href, tone, children }: { href: string; tone: keyof typeof CTA_TONES; children: React.ReactNode }) {
  return (
    <Link
      href={href}
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

/** "21/10 17:48" — data/hora da coleta exibida nos cards de rodovia. */
function formatRouteTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/** Chip discreto de proveniencia — nunca fingir frescor de dado estimado. */
function EstimatedBadge() {
  return (
    <span
      className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-700/50 text-slate-400 border border-slate-600/50"
      title="Dado estimado (sem fonte ao vivo no momento)"
    >
      estimado
    </span>
  );
}

export default function HomePage() {
  const { cities, loading: citiesLoading } = useAllCities();
  const { data: swellData, loading: swellLoading } = useSwell();
  const { data: aiData, loading: aiLoading } = useAiSummary();
  const { data: newsData, loading: newsLoading } = useRegionalNews();
  const { data: surfNewsData, loading: surfNewsLoading } = useNews();
  const { data: comercioData, loading: comercioLoading } = useComercio();

  const [newsCategory, setNewsCategory] = useState('todas');

  const latestNews = newsData?.news?.slice(0, 6) ?? [];
  const routes = newsData?.routes ?? [];
  const commerce = comercioData?.commerce?.slice(0, 6) ?? [];

  const filteredNews = newsCategory === 'todas'
    ? latestNews
    : latestNews.filter(n => n.category === newsCategory);

  return (
    <main className="space-y-8" role="main" aria-label="Painel principal do Meteor 2.0">
      <h1 className="sr-only">Meteor 2.0 — Previsão, notícias e condições do mar do Vale do Ribeira e Ilha Comprida</h1>

      <a href="#conteudo" className="skip-link sr-only">
        Pular para o conteúdo
      </a>

      <nav aria-label="Navegação rápida" className="sr-only focus-within:not-sr-only">
        <a href="#conteudo" className="block p-2 bg-slate-700 text-white rounded-lg">Pular para o conteúdo</a>
        <a href="#tempo" className="block p-2 bg-amber-600 text-white rounded-lg">Pular para Previsão do Tempo</a>
        <a href="#noticias" className="block p-2 bg-blue-600 text-white rounded-lg">Pular para Últimas Notícias</a>
        <a href="#mar" className="block p-2 bg-cyan-600 text-white rounded-lg">Pular para Condições do Mar</a>
        <a href="#briefing" className="block p-2 bg-cyan-600 text-white rounded-lg">Pular para Briefing IA</a>
        <a href="#rodovias" className="block p-2 bg-amber-600 text-white rounded-lg">Pular para Rodovias</a>
        <a href="#comercio" className="block p-2 bg-orange-600 text-white rounded-lg">Pular para Comércio</a>
        <a href="#surf-news" className="block p-2 bg-amber-600 text-white rounded-lg">Pular para Notícias de Surf</a>
        <a href="#blog" className="block p-2 bg-emerald-600 text-white rounded-lg">Pular para Blog</a>
      </nav>

      {/* 1. Hero Carousel — slide 1: Notícias do Vale */}
      <HeroCarousel />

      <div id="conteudo" tabIndex={-1} className="space-y-8 outline-none">
        {/* 2. Previsão do Tempo — 4 cidades (hoje: atual + max/min) */}
        <ForecastSection
          id="tempo"
          title="Previsão do Tempo"
          icon={<FaCloudSun className="w-5 h-5 text-amber-400" aria-hidden="true" />}
          ariaLabel="Previsão do tempo das 4 cidades"
          ariaBusy={citiesLoading}
          action={<SectionCta href="/meteorologia" tone="amber">Ver previsão</SectionCta>}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="list" aria-label="Temperatura atual das cidades">
            {(['ilha-comprida', 'iguape', 'cananeia', 'registro'] as const).map(id => {
              const city = cities[id];
              const maxMin = city?.tempMax != null && city?.tempMin != null
                ? `Máx ${Math.round(city.tempMax)} graus, mín ${Math.round(city.tempMin)} graus`
                : null;
              return (
                <Link
                  key={id}
                  href={`/meteorologia?city=${id}`}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 hover:border-amber-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  role="listitem"
                  title={`${city?.location ?? id}: ${city ? `${Math.round(city.temperature)}°C` : 'Carregando...'}`}
                  aria-label={`${city?.location ?? id}: ${city ? `${Math.round(city.temperature)} graus, ${weatherEmoji(city.weatherCode)}${maxMin ? `. ${maxMin}` : ''}` : 'carregando'}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 truncate">
                    {city?.location ?? id.replace(/-/g, ' ')}
                  </p>
                  <div className="flex items-center gap-2">
                    {city && <span className="text-xl" aria-hidden="true">{weatherEmoji(city.weatherCode)}</span>}
                    <span className="text-2xl font-extrabold text-white tabular-nums">
                      {citiesLoading ? '--' : city ? `${Math.round(city.temperature)}°` : '--'}
                    </span>
                  </div>
                  {city?.tempMax != null && city?.tempMin != null && (
                    <p className="text-[10px] text-amber-400/90 font-medium mt-1 tabular-nums">
                      ▲ {Math.round(city.tempMax)}° · ▼ {Math.round(city.tempMin)}°
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                    {city && (
                      <>
                        <span>💧 {city.humidity}%</span>
                        <span>💨 {Math.round(city.windSpeed)} km/h</span>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </ForecastSection>

        {/* 3. Últimas Notícias Regionais */}
        <ForecastSection
          id="noticias"
          title="Últimas Notícias Regionais"
          icon={<FaNewspaper className="w-5 h-5 text-blue-400" aria-hidden="true" />}
          ariaLabel="Notícias regionais do Vale do Ribeira"
          ariaBusy={newsLoading}
          action={<SectionCta href="/noticias" tone="blue">Ver todas</SectionCta>}
        >
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtrar notícias por categoria">
            {['todas', ...Object.keys(CATEGORY_CONFIG)].map(key => {
              const cfg = key === 'todas' ? { label: 'Todas', emoji: '📰', color: 'text-slate-300', bg: 'bg-slate-800/40' } : CATEGORY_CONFIG[key];
              return (
                <button
                  key={key}
                  onClick={() => setNewsCategory(key)}
                  aria-pressed={newsCategory === key}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    newsCategory === key
                      ? `${cfg.bg} ${cfg.color} border-current`
                      : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              );
            })}
          </div>

          {newsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-busy="true">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-slate-800 rounded w-20 mb-3" />
                  <div className="h-5 bg-slate-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-800 rounded w-full mb-1" />
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
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
                    aria-label={`${item.title}, fonte: ${item.source}`}
                    className="group bg-slate-900/80 border border-slate-800 rounded-2xl p-4 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${catCfg.bg} ${catCfg.color} border-current`}>
                        {catCfg.emoji} {catCfg.label}
                      </span>
                      <FaExternalLinkAlt className="w-3 h-3 text-slate-400 group-hover:text-blue-400 transition-colors" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3 max-h-8 group-hover:max-h-40 overflow-hidden transition-all duration-300 ease-in-out">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-medium">{item.source}</span>
                      <span>{timeAgo(item.publishedAt)}</span>
                    </div>
                  </a>
                );
              })}
              {filteredNews.length === 0 && (
                <p className="text-sm text-slate-400 col-span-full text-center py-8">
                  Nenhuma notícia encontrada nesta categoria.
                </p>
              )}
            </div>
          )}
        </ForecastSection>

        {/* 4. Condições do Mar */}
        <ForecastSection
          id="mar"
          title="Condições do Mar"
          icon={<FaWater className="w-5 h-5 text-cyan-400" aria-hidden="true" />}
          ariaLabel="Condições atuais de ondas e mar"
          ariaBusy={swellLoading}
          action={<SectionCta href="/swell?tab=overview" tone="cyan">Ver detalhes</SectionCta>}
        >
          {swellLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2" aria-busy="true">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-slate-700" />
                  <div className="h-5 bg-slate-700 rounded w-12" />
                  <div className="h-3 bg-slate-700 rounded w-16" />
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
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center text-slate-400">
              Dados oceânicos indisponíveis
            </div>
          )}
        </ForecastSection>

        {/* 5. Briefing Executivo IA */}
        <ForecastSection
          id="briefing"
          title="Briefing Executivo (IA)"
          icon={<span aria-hidden="true">🤖</span>}
          ariaLabel="Resumo inteligente das condições"
          ariaBusy={aiLoading}
          action={<SectionCta href="/swell?tab=forecast" tone="cyan">Abrir briefing</SectionCta>}
        >
          {aiLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse" aria-busy="true">
              <div className="h-4 bg-slate-800 rounded w-48 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-800 rounded w-5/6" />
                <div className="h-3 bg-slate-800 rounded w-4/6" />
              </div>
            </div>
          ) : (
            <ResumoIA summary={aiData?.summary ?? null} loading={aiLoading} error={null} />
          )}
        </ForecastSection>

        {/* 6. Status das Rodovias */}
        <ForecastSection
          id="rodovias"
          title="Status das Rodovias"
          icon={<FaCar className="w-5 h-5 text-amber-400" aria-hidden="true" />}
          ariaLabel="Condições de tráfego das rodovias"
          ariaBusy={newsLoading}
          action={<SectionCta href="/noticias#rodovias" tone="amber">Ver em Notícias</SectionCta>}
        >
          {newsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3" aria-busy="true">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 animate-pulse">
                  <div className="h-4 bg-slate-800 rounded w-24 mb-3" />
                  <div className="h-6 bg-slate-800 rounded w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {routes.map(route => {
                const colors = ROUTE_CONDITION_COLORS[route.condition] ?? ROUTE_CONDITION_COLORS.LIVRE;
                const emoji = ROUTE_ICONS[route.id] ?? '🚗';
                return (
                  <Link
                    key={route.id}
                    href={route.sourceUrl || '/noticias'}
                    target={route.sourceUrl ? '_blank' : undefined}
                    rel={route.sourceUrl ? 'noopener noreferrer' : undefined}
                    className={`bg-slate-900/80 border ${colors.border} rounded-2xl p-3 hover:scale-[1.02] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
                    title={`${route.name}: ${route.condition} — ${route.description}`}
                    aria-label={`${route.name}: ${route.condition} — abrir na fonte oficial`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg" aria-hidden="true">{emoji}</span>
                      <span className="text-sm font-bold text-white">{route.name}</span>
                      {route.source === 'estimated' && <EstimatedBadge />}
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {route.condition}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 truncate" title={route.description}>{route.description}</p>
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        {route.sourceUrl ? (
                          <>Fonte <FaExternalLinkAlt className="w-2.5 h-2.5" aria-hidden="true" /></>
                        ) : (
                          'Fonte não informada'
                        )}
                      </span>
                      <span title={`Última atualização: ${new Date(route.updatedAt).toLocaleString('pt-BR')}`}>
                        {formatRouteTime(route.updatedAt)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </ForecastSection>

        {/* 7. Comércio em Destaque */}
        <ForecastSection
          id="comercio"
          title="Comércio em Destaque"
          icon={<FaStore className="w-5 h-5 text-orange-400" aria-hidden="true" />}
          ariaLabel="Estabelecimentos comerciais de Ilha Comprida"
          ariaBusy={comercioLoading}
          action={<SectionCta href="/comercio" tone="orange">Ver diretório</SectionCta>}
        >
          {comercioLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-busy="true">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 animate-pulse">
                  <div className="h-4 bg-slate-800 rounded w-20 mb-3" />
                  <div className="h-5 bg-slate-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-800 rounded w-full" />
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
                  aria-label={`${item.name}, setor: ${item.sector}`}
                  className="group bg-slate-900/80 border border-slate-800 rounded-2xl p-3 hover:border-orange-500/30 hover:bg-slate-800/60 transition-all overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl" aria-hidden="true">{SECTOR_ICONS[item.sector] ?? '🏪'}</span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors truncate">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-orange-400 font-medium">{item.sector}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 max-h-8 group-hover:max-h-40 overflow-hidden transition-all duration-300 ease-in-out mb-2">{item.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate">{item.address}</span>
                    <FaExternalLinkAlt className="w-3 h-3 text-slate-400 group-hover:text-orange-400 transition-colors flex-shrink-0" aria-hidden="true" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </ForecastSection>

        {/* 8. Notícias de Surf (WSL e Circuito Paulista em pt-BR) */}
        <ForecastSection
          id="surf-news"
          title="Notícias de Surf"
          icon={<FaWater className="w-5 h-5 text-amber-400" aria-hidden="true" />}
          ariaLabel="Notícias e competições de surf WSL e Circuito Paulista"
          ariaBusy={surfNewsLoading}
          action={<SectionCta href="/swell?tab=news" tone="blue">Ver todas</SectionCta>}
        >
          {surfNewsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-busy="true">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse">
                  <div className="h-32 bg-slate-800 rounded mb-3" />
                  <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
              {surfNewsData?.news?.slice(0, 3).map(item => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${item.title} — ${item.source} (abrir em nova aba)`}
                  aria-label={`${item.title}, fonte: ${item.source}`}
                  role="listitem"
                  className="group rounded-xl overflow-hidden bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:border-blue-500/30 transition-all"
                >
                  <div className="h-40 bg-slate-800 overflow-hidden relative">
                    <img
                      src={item.image || (item.category === 'WSL' ? 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67' : 'https://static.wixstatic.com/media/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.jpeg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.webp')}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = item.category === 'WSL' ? 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67' : 'https://static.wixstatic.com/media/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.jpeg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.webp';
                      }}
                    />
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-medium border ${item.category === 'WSL' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">{item.title}</h3>
                      <FaExternalLinkAlt className="w-3 h-3 text-slate-400 group-hover:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                    </div>
                    <p className="text-[10px] text-blue-400 font-medium mb-1">{item.source}</p>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
                    <p className="text-[9px] text-slate-400 mt-2 font-mono">
                      {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </a>
              ))}
              {(!surfNewsData?.news?.length && !surfNewsLoading) && (
                <p className="col-span-full text-center py-8 text-slate-400 text-sm">
                  Nenhuma notícia de surf disponível no momento.
                </p>
              )}
            </div>
          )}
        </ForecastSection>

        {/* 9. Blog & Navegação */}
        <ForecastSection
          id="blog"
          title="Blog & Navegação"
          icon={<FaBookOpen className="w-5 h-5 text-emerald-400" aria-hidden="true" />}
          ariaLabel="Artigos do blog e navegação do portal"
          action={<SectionCta href="/blog" tone="emerald">Ver todos</SectionCta>}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: 'Guia de Marés', category: 'Maré', gradient: 'from-blue-600 to-cyan-600', href: '/blog' },
              { title: 'Ventos de Inverno', category: 'Clima', gradient: 'from-amber-600 to-orange-600', href: '/blog' },
              { title: 'Dinâmica Costeira', category: 'Oceanografia', gradient: 'from-emerald-600 to-teal-600', href: '/blog' },
              { title: 'Reserva de Cananéia', category: 'Meio Ambiente', gradient: 'from-green-600 to-emerald-600', href: '/blog' },
            ].map(post => (
              <Link
                key={post.title}
                href={post.href}
                className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <div className={`h-20 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                  <FaBookOpen className="w-8 h-8 text-white/30" aria-hidden="true" />
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{post.category}</span>
                  <h3 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </ForecastSection>
      </div>
    </main>
  );
}
