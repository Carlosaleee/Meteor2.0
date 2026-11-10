import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowLeft, FaCalendar, FaClock, FaUser } from 'react-icons/fa';
import { getPostBySlug, publishedPosts } from '@/data/blog-posts';
import { BlogContent } from '@/components/blog/BlogContent';
import { formatBlogDate } from '@/components/blog/BlogCard';
import { buildArticleJsonLd, buildFaqJsonLd, serializeJsonLd } from '@/lib/blog-jsonld';

type Params = { slug: string };

/** Apenas slugs publicados são pré-renderizados no build (404 para o resto). */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publishedPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.metaTitle,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.metaTitle,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      siteName: 'Meteor 2.0',
      locale: 'pt_BR',
      images: [{ url: post.imageUrl, alt: post.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const faqJsonLd = buildFaqJsonLd(post);

  return (
    <article className="space-y-6">
      {/* Dados estruturados — Article + FAQPage (GEO / AI Overviews) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildArticleJsonLd(post)) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
        />
      )}

      {/* Voltar + breadcrumbs */}
      <div className="space-y-2">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-blue-400 transition-colors hover:text-blue-300"
          title="Voltar para a listagem do blog"
        >
          <FaArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Voltar ao Blog
        </Link>
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
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
            <li className="text-card-muted">{post.category}</li>
          </ol>
        </nav>
      </div>

      {/* Hero: H1 + meta + capa expandida */}
      <header className="space-y-4">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${post.categoryColor}`}
        >
          {post.category}
        </span>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <FaUser className="h-3 w-3" aria-hidden />
            {post.author}
          </span>
          <time dateTime={post.date} className="flex items-center gap-1.5">
            <FaCalendar className="h-3 w-3" aria-hidden />
            {formatBlogDate(post.date)}
          </time>
          <span className="flex items-center gap-1.5">
            <FaClock className="h-3 w-3" aria-hidden />
            {post.readTime}
          </span>
        </div>
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl border border-card-border">
          <Image
            src={post.imageUrl}
            alt={post.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </div>
      </header>

      {/* Corpo: blocos tipados + FAQ + links de saída */}
      <BlogContent post={post} />
    </article>
  );
}
