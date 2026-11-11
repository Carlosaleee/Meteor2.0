import Image from 'next/image';
import Link from 'next/link';
import { FaCalendar, FaClock, FaArrowRight, FaBookOpen } from 'react-icons/fa';
import type { BlogPost } from '@/types/blog';
import { useI18n, useDict } from '@/i18n/context';
import { blog } from '@/i18n/dictionaries/blog';
import { fmt } from '@/i18n/format';

/**
 * `YYYY-MM-DD` → `DD/MM/YYYY`. Usa UTC para não deslocar o dia (sem
 * `new Date()` local) e o `locale` para formatar em pt-BR ou es-ES.
 */
export function formatBlogDate(iso: string, locale: string = 'pt-BR'): string {
  const [y, m, d] = iso.split('-');
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${y}-${m}-${d}T00:00:00Z`));
  } catch {
    return `${d}/${m}/${y}`;
  }
}

type BlogCardProps = {
  post: BlogPost;
};

/**
 * Card de listagem do blog — capa real (`next/image` com `fill`), badge de
 * categoria flutuante, data, tempo de leitura e hover (zoom sutil no CSS).
 * Posts `coming-soon` renderizam sem link e com badge "Em breve".
 */
export function BlogCard({ post }: BlogCardProps) {
  const published = post.status === 'published';
  const t = useDict(blog);
  const { lang } = useI18n();
  const locale = lang === 'pt' ? 'pt-BR' : 'es-ES';

  const cover = (
    <div className="relative h-44 w-full overflow-hidden">
      <Image
        src={post.imageUrl}
        alt={post.imageAlt}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
      <span
        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${post.categoryColor}`}
      >
        {post.category}
      </span>
      {!published && (
        <span className="absolute right-3 top-3 rounded-full bg-card/80 px-2.5 py-1 text-[10px] font-bold text-amber-400 ring-1 ring-amber-400/40">
          {t['card.comingSoon']}
        </span>
      )}
    </div>
  );

  const body = (
    <div className="p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex items-center gap-1 text-[10px] text-card-dim">
          <FaCalendar className="h-3 w-3" aria-hidden />
          {formatBlogDate(post.date, locale)}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-card-dim">
          <FaClock className="h-3 w-3" aria-hidden />
          {post.readTime}
        </span>
      </div>

      <h3 className="mb-2 text-lg font-bold text-card-text transition-colors group-hover:text-blue-300">
        {post.title}
      </h3>

      <p className="mb-4 text-xs leading-relaxed text-card-muted">{post.summary}</p>

      {published ? (
        <span className="flex items-center gap-1 text-xs text-blue-400 transition-colors group-hover:text-blue-300">
          {t['a11y.openPost']}
          <FaArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-card-dim">
          <FaBookOpen className="h-3.5 w-3.5" aria-hidden />
          {t['card.inProduction']}
        </span>
      )}
    </div>
  );

  const cardClass =
    'group block overflow-hidden rounded-2xl border border-card-border bg-card shadow-lg transition-all duration-300';

  if (!published) {
    return (
      <article className={`${cardClass} opacity-80`} aria-label={fmt(t['a11y.comingSoon'], { title: post.title })}>
        {cover}
        {body}
      </article>
    );
  }

  return (
    <article className={`${cardClass} hover:border-blue-500/50 hover:shadow-blue-500/10`}>
      <Link
        href={`/blog/${post.slug}`}
        className="focus-visible:outline-none"
        title={t['a11y.openPostTitle']}
        aria-label={`${t['a11y.openPostTitle']}: ${post.title}`}
      >
        {cover}
        {body}
      </Link>
    </article>
  );
}
