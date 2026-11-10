'use client';

import { FaBookOpen } from 'react-icons/fa';
import { PageBanner } from '@/components/PageBanner';
import { BlogCard } from '@/components/blog/BlogCard';
import { publishedPosts, comingSoonPosts } from '@/data/blog-posts';
import { useDict } from '@/i18n/context';
import { blog } from '@/i18n/dictionaries/blog';

export function BlogContent() {
  const published = publishedPosts();
  const upcoming = comingSoonPosts();
  const t = useDict(blog);

  return (
    <div className="space-y-8">
      <PageBanner title={t['page.title']} subtitle={t['page.subtitle']} />

      <div>
        <h2 className="flex items-center gap-3 text-3xl font-extrabold text-white">
          <FaBookOpen className="h-8 w-8 text-blue-500" aria-hidden />
          {t['section.recent.title']}
        </h2>
        <p className="mt-1 text-sm text-card-muted">{t['section.recent.desc']}</p>
      </div>

      {/* Grid de Artigos publicados */}
      <div className="grid gap-6 sm:grid-cols-2">
        {published.map(post => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      {/* Em breve */}
      {upcoming.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-card-subtle">{t['section.soon.title']}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {upcoming.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
