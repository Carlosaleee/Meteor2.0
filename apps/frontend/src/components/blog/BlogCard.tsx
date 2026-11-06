import Image from 'next/image';
import Link from 'next/link';
import { FaCalendar, FaClock, FaArrowRight, FaBookOpen } from 'react-icons/fa';
import type { BlogPost } from '@/types/blog';

/** `YYYY-MM-DD` → `DD/MM/YYYY` (sem `new Date()` para evitar shift de timezone). */
export function formatBlogDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
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
        <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-amber-400 ring-1 ring-amber-400/40">
          Em breve
        </span>
      )}
    </div>
  );

  const body = (
    <div className="p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <FaCalendar className="h-3 w-3" aria-hidden />
          {formatBlogDate(post.date)}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <FaClock className="h-3 w-3" aria-hidden />
          {post.readTime}
        </span>
      </div>

      <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-blue-300">
        {post.title}
      </h3>

      <p className="mb-4 text-xs leading-relaxed text-slate-400">{post.summary}</p>

      {published ? (
        <span className="flex items-center gap-1 text-xs text-blue-400 transition-colors group-hover:text-blue-300">
          Ler artigo completo
          <FaArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <FaBookOpen className="h-3.5 w-3.5" aria-hidden />
          Artigo em produção
        </span>
      )}
    </div>
  );

  const cardClass =
    'group block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg transition-all duration-300';

  if (!published) {
    return (
      <article className={`${cardClass} opacity-80`} aria-label={`${post.title} (em breve)`}>
        {cover}
        {body}
      </article>
    );
  }

  return (
    <article className={`${cardClass} hover:border-blue-500/50 hover:shadow-blue-500/10`}>
      <Link href={`/blog/${post.slug}`} className="focus-visible:outline-none">
        {cover}
        {body}
      </Link>
    </article>
  );
}
