import type { Metadata } from 'next';
import { FaBookOpen } from 'react-icons/fa';
import { PageBanner } from '@/components/PageBanner';
import { BlogCard } from '@/components/blog/BlogCard';
import { publishedPosts, comingSoonPosts } from '@/data/blog-posts';

export const metadata: Metadata = {
  title: 'Blog | Meteor 2.0',
  description:
    'Guias e artigos sobre marés, surf, ecoturismo e meio ambiente no Litoral Sul de SP: Ilha Comprida, Cananéia, Juréia e o Vale do Ribeira.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Meteor 2.0',
    description:
      'Guias e artigos sobre marés, surf, ecoturismo e meio ambiente no Litoral Sul de SP.',
    url: '/blog',
    type: 'website',
    siteName: 'Meteor 2.0',
    locale: 'pt_BR',
  },
};

export default function BlogPage() {
  const published = publishedPosts();
  const upcoming = comingSoonPosts();

  return (
    <div className="space-y-8">
      <PageBanner
        title="Blog"
        subtitle="Artigos e guias especiais sobre o clima e litoral do Vale do Ribeira"
      />

      <div>
        <h2 className="flex items-center gap-3 text-3xl font-extrabold text-white">
          <FaBookOpen className="h-8 w-8 text-blue-500" aria-hidden />
          Artigos recentes
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Marés, surf, ecoturismo e meio ambiente — com os dados do Meteor 2.0 em cada guia.
        </p>
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
          <h2 className="text-xl font-bold text-slate-300">Em breve</h2>
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
