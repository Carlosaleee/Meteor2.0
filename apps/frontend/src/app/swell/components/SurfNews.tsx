'use client';

import { FaExternalLinkAlt, FaNewspaper } from 'react-icons/fa';
import type { NewsItem } from '@/lib/api';

type SurfNewsProps = {
  news: NewsItem[];
  loading: boolean;
  category?: 'WSL' | 'Paulista';
  title?: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  WSL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Paulista: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const FALLBACK_IMAGES: Record<string, string> = {
  WSL: 'https://d3qf8nvav5av0u.cloudfront.net/image/36f55b820cedc83386660b0b8607bbd8.png?&x=767&y=431&icq=74&sig=2ae59a9e95734d205f05906468df7b67',
  Paulista: 'https://static.wixstatic.com/media/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.jpeg/v1/fill/w_333,h_250,fp_0.50_0.50,q_90,enc_avif,quality_auto/690598_47f1e0412d094a85b18f742a3ef4d9be~mv2.webp',
};

export function SurfNews({ news, loading, category, title }: SurfNewsProps) {
  const filtered = category ? news.filter(n => n.category === category) : news;

  if (loading) {
    return (
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
        <div className="h-4 bg-slate-800 rounded w-36 mb-4" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label={title || 'Notícias de surf'}>
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
        <FaNewspaper className="w-4 h-4 text-blue-400" aria-hidden="true" />
        {title || 'Notícias de Surf'}
        <span className="text-[10px] text-slate-500 font-normal ml-1">({filtered.length} matérias)</span>
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
        {filtered.map(item => (
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
                src={item.image || FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES.WSL}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES.WSL;
                }}
              />
              <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-medium border ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.WSL}`}>
                {item.category}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">{item.title}</h4>
                <FaExternalLinkAlt className="w-3 h-3 text-slate-500 group-hover:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
              </div>
              <p className="text-[10px] text-blue-400 font-medium mb-1">{item.source}</p>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
              <p className="text-[9px] text-slate-600 mt-2 font-mono">
                {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
