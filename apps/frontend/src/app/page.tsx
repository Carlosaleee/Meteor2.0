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
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaArrowRight,
} from 'react-icons/fa';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ChatWidget } from '@/components/ChatWidget';
import { ForecastSection } from '@/app/swell/components/ForecastSection';
import { ResumoIA } from '@/app/swell/components/ResumoIA';
import { ConditionCards } from '@/app/swell/components/ConditionCards';
import { SurfNews } from '@/app/swell/components/SurfNews';
import { useAllCities } from '@/hooks/useAllCities';
import { useSwell } from '@/hooks/useSwell';
import { useAiSummary } from '@/hooks/useAiSummary';
import { useRegionalNews } from '@/hooks/useRegionalNews';
import { useLocalismo } from '@/hooks/useLocalismo';
import { useNews } from '@/hooks/useNews';
import { weatherEmoji } from '@/app/meteorologia/components/weather-utils';

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

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  transito: { label: 'Trânsito', emoji: '🚗', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  noticia: { label: 'Notícia', emoji: '📰', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  policial: { label: 'Policial', emoji: '🚨', color: 'text-red-400', bg: 'bg-red-500/10' },
  turismo: { label: 'Turismo', emoji: '🏖️', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  cotidiano: { label: 'Cotidiano', emoji: '🏠', color: 'text-purple-400', bg: 'bg-purple-500/10' },
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function HomePage() {
  const { cities, loading: citiesLoading } = useAllCities();
  const { data: swellData, loading: swellLoading } = useSwell();
  const { data: aiData, loading: aiLoading } = useAiSummary();
  const { data: newsData, loading: newsLoading } = useRegionalNews();
  const { data: surfNewsData, loading: surfNewsLoading } = useNews();
  const { data: localismoData, loading: localismoLoading } = useLocalismo();

  const [newsCategory, setNewsCategory] = useState('todas');

  const latestNews = newsData?.news?.slice(0, 6) ?? [];
  const routes = newsData?.routes ?? [];
  const commerce = localismoData?.commerce?.slice(0, 6) ?? [];

  const filteredNews = newsCategory === 'todas'
    ? latestNews
    : latestNews.filter(n => n.category === newsCategory);

  return (
    <main className="space-y-8" role="main" aria-label="Painel principal do Meteor 2.0">
      <nav aria-label="Navegação rápida" className="sr-only focus-within:not-sr-only">
        <a href="#alerta" className="block p-2 bg-amber-600 text-white rounded-lg">Pular para Alerta Regional</a>
        <a href="#noticias" className="block p-2 bg-blue-600 text-white rounded-lg">Pular para Notícias Regionais</a>
        <a href="#briefing" className="block p-2 bg-cyan-600 text-white rounded-lg">Pular para Briefing IA</a>
        <a href="#tempo" className="block p-2 bg-blue-600 text-white rounded-lg">Pular para Tempo Agora</a>
        <a href="#mar" className="block p-2 bg-cyan-600 text-white rounded-lg">Pular para Condições do Mar</a>
        <a href="#surf-news" className="block p-2 bg-amber-600 text-white rounded-lg">Pular para Notícias de Surf</a>
        <a href="#rodovias" className="block p-2 bg-amber-600 text-white rounded-lg">Pular para Rodovias</a>
        <a href="#comercio" className="block p-2 bg-orange-600 text-white rounded-lg">Pular para Comércio</a>
        <a href="#blog" className="block p-2 bg-emerald-600 text-white rounded-lg">Pular para Blog</a>
      </nav>

      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Alerta Regional */}
      <ForecastSection
        id="alerta"
        title="Alerta Regional"
        icon={<FaExclamationTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" />}
        ariaLabel="Alertas regionais de trânsito e condições"
      >
        {newsLoading ? (
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
      </ForecastSection>

      {/* 3. Últimas Notícias Regionais (reposicionado) */}
      <ForecastSection
        id="noticias"
        title="Últimas Notícias Regionais"
        icon={<FaNewspaper className="w-5 h-5 text-blue-400" aria-hidden="true" />}
        ariaLabel="Notícias regionais do Vale do Ribeira"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {['todas', ...Object.keys(CATEGORY_CONFIG)].map(key => {
            const cfg = key === 'todas' ? { label: 'Todas', emoji: '📰', color: 'text-slate-300', bg: 'bg-slate-800/40' } : CATEGORY_CONFIG[key];
            return (
              <button
                key={key}
                onClick={() => setNewsCategory(key)}
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
            {filteredNews.length === 0 && (
              <p className="text-sm text-slate-500 col-span-full text-center py-8">
                Nenhuma notícia encontrada nesta categoria.
              </p>
            )}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Ver todas as notícias <FaArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </ForecastSection>

      {/* 4. Briefing Executivo IA */}
      <ForecastSection
        id="briefing"
        title="Briefing Executivo (IA)"
        icon={<span aria-hidden="true">🤖</span>}
        ariaLabel="Resumo inteligente das condições"
      >
        {aiLoading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
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

      {/* 5. Tempo Agora — 4 cidades */}
      <ForecastSection
        id="tempo"
        title="Tempo Agora"
        icon={<FaCloudSun className="w-5 h-5 text-amber-400" aria-hidden="true" />}
        ariaLabel="Condições meteorológicas das 4 cidades"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Temperatura atual das cidades">
          {(['ilha-comprida', 'iguape', 'cananeia', 'registro'] as const).map(id => {
            const city = cities[id];
            return (
              <Link
                key={id}
                href={`/meteorologia?city=${id}`}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                role="listitem"
                title={`${city?.location ?? id}: ${city ? `${Math.round(city.temperature)}°C` : 'Carregando...'}`}
                aria-label={`${city?.location ?? id}: ${city ? `${Math.round(city.temperature)} graus, ${weatherEmoji(city.weatherCode)}` : 'carregando'}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 truncate">
                  {city?.location ?? id.replace(/-/g, ' ')}
                </p>
                <div className="flex items-center gap-2">
                  {city && <span className="text-2xl" aria-hidden="true">{weatherEmoji(city.weatherCode)}</span>}
                  <span className="text-3xl font-extrabold text-white tabular-nums">
                    {citiesLoading ? '--' : city ? `${Math.round(city.temperature)}°` : '--'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
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

      {/* 6. Condições do Mar */}
      <ForecastSection
        id="mar"
        title="Condições do Mar"
        icon={<FaWater className="w-5 h-5 text-cyan-400" aria-hidden="true" />}
        ariaLabel="Condições atuais de ondas e mar"
      >
        {swellLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-slate-500">
            Dados oceânicos indisponíveis
          </div>
        )}
      </ForecastSection>

      {/* 7. Notícias de Surf (novo) */}
      <ForecastSection
        id="surf-news"
        title="Notícias de Surf"
        icon={<FaWater className="w-5 h-5 text-amber-400" aria-hidden="true" />}
        ariaLabel="Notícias e competições de surf WSL e Circuito Paulista"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {surfNewsData?.news?.map((item, index) => (
            <div key={item.id} className="group">
              <SurfNews
                news={[item]}
                loading={surfNewsLoading}
                category={item.category as 'WSL' | 'Paulista'}
                title={index === 0 ? undefined : ''}
              />
            </div>
          ))}
          {(!surfNewsData?.news?.length && !surfNewsLoading) && (
            <div className="col-span-full text-center py-8 text-slate-500">
              Nenhuma notícia de surf disponível no momento.
            </div>
          )}
        </div>
      </ForecastSection>

      {/* 8. Status das Rodovias */}
      <ForecastSection
        id="rodovias"
        title="Status das Rodovias"
        icon={<FaCar className="w-5 h-5 text-amber-400" aria-hidden="true" />}
        ariaLabel="Condições de tráfego das rodovias"
      >
        {newsLoading ? (
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
                <Link
                  key={route.id}
                  href="/noticias"
                  className={`bg-slate-900/80 border ${colors.border} rounded-2xl p-5 hover:scale-[1.02] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
                  title={`${route.name}: ${route.condition}`}
                  aria-label={`${route.name}: ${route.condition} — clique para ver detalhes`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg" aria-hidden="true">{emoji}</span>
                    <span className="text-sm font-bold text-white">{route.name}</span>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {route.condition}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </ForecastSection>

      {/* 9. Comércio em Destaque */}
      <ForecastSection
        id="comercio"
        title="Comércio em Destaque"
        icon={<FaStore className="w-5 h-5 text-orange-400" aria-hidden="true" />}
        ariaLabel="Estabelecimentos comerciais de Ilha Comprida"
      >
        {localismoLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-20 mb-3" />
                <div className="h-5 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {commerce.map(item => (
              <a
                key={item.id}
                href={item.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`${item.name} — ${item.sector}`}
                aria-label={`${item.name}, setor: ${item.sector}`}
                className="group bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-orange-500/30 hover:bg-slate-800/60 transition-all"
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
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{item.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate">{item.address}</span>
                  <FaExternalLinkAlt className="w-3 h-3 text-slate-600 group-hover:text-orange-400 transition-colors flex-shrink-0" aria-hidden="true" />
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link
            href="/comercio"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-semibold hover:bg-orange-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            Ver diretório completo <FaArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </ForecastSection>

      {/* 10. Blog & Navegação */}
      <ForecastSection
        id="blog"
        title="Blog & Navegação"
        icon={<FaBookOpen className="w-5 h-5 text-emerald-400" aria-hidden="true" />}
        ariaLabel="Artigos do blog e navegação do portal"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className={`h-24 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                <FaBookOpen className="w-8 h-8 text-white/30" aria-hidden="true" />
              </div>
              <div className="p-4">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{post.category}</span>
                <h3 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Ver todos os artigos <FaArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </ForecastSection>

      <ChatWidget />
    </main>
  );
}