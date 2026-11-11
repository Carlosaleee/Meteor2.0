'use client';

import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useDict } from '@/i18n/context';
import { blog } from '@/i18n/dictionaries/blog';

/**
 * Voltar + breadcrumbs do artigo — componente client para traduzir
 * `title`/`aria-label`/texto visível via dicionário (o `[slug]/page.tsx`
 * é server component e não pode usar hooks de i18n).
 */
export function BlogArticleNav({ category }: { category: string }) {
  const t = useDict(blog);

  return (
    <div className="space-y-2">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-blue-400 transition-colors hover:text-blue-300"
        title={t['article.backTitle']}
        aria-label={`${t['article.back']}: ${t['article.backTitle']}`}
      >
        <FaArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {t['article.back']}
      </Link>
      <nav aria-label={t['article.breadcrumb']} className="text-xs text-card-dim">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="transition-colors hover:text-card-subtle">
              Meteor
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/blog" className="transition-colors hover:text-card-subtle">
              Blog
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-card-muted">{category}</li>
        </ol>
      </nav>
    </div>
  );
}
