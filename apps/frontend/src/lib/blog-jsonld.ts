import type { BlogPost } from '@/types/blog';

/** URL canônica do site — espelha `metadataBase` de `src/app/layout.tsx`. */
export const SITE_URL = 'https://meteor2-0-frontend.vercel.app';

/**
 * JSON-LD `Article` do post — injetado em `/blog/[slug]`.
 * URLs absolutas (schema.org exige `@id`/`url` absolutos).
 */
export function buildArticleJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: `${SITE_URL}${post.imageUrl}`,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Meteor 2.0',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/CapaMeteor.jpg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    articleSection: post.category,
    inLanguage: 'pt-BR',
    keywords: post.keywords.join(', '),
  };
}

/**
 * JSON-LD `FAQPage` a partir das perguntas PAA — retorna `null` quando o post
 * não tem FAQ (posts `coming-soon`), para não emitir schema vazio.
 */
export function buildFaqJsonLd(post: BlogPost): Record<string, unknown> | null {
  if (!post.faq || post.faq.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/**
 * Serialização segura para `<script type="application/ld+json">`:
 * escapa `<` para impedir quebra de tag/`</script>` injection.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
