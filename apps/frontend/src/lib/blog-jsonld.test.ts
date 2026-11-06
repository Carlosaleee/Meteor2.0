import { describe, it, expect } from 'vitest';
import { buildArticleJsonLd, buildFaqJsonLd, serializeJsonLd, SITE_URL } from './blog-jsonld';
import { BLOG_POSTS, getPostBySlug, comingSoonPosts } from '@/data/blog-posts';

type ArticleLd = {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  datePublished: string;
  articleSection: string;
  inLanguage: string;
  keywords: string;
  image: string;
  mainEntityOfPage: { '@id': string };
  publisher: { name: string; logo: { url: string } };
  author: { '@type': string; name: string };
};

type FaqLd = {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: { '@type': string; text: string };
  }>;
};

const post = getPostBySlug('tabua-de-mares-ilha-comprida-cananeia')!;

describe('buildArticleJsonLd', () => {
  it('gera schema Article com campos obrigatórios', () => {
    const ld = buildArticleJsonLd(post) as unknown as ArticleLd;

    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Article');
    expect(ld.headline).toBe(post.title);
    expect(ld.description).toBe(post.description);
    expect(ld.datePublished).toBe('2026-09-05');
    expect(ld.articleSection).toBe('Maré');
    expect(ld.inLanguage).toBe('pt-BR');
  });

  it('usa URLs absolutas para image, publisher e mainEntityOfPage', () => {
    const ld = buildArticleJsonLd(post) as unknown as ArticleLd;

    expect(ld.image).toBe(`${SITE_URL}/blog/tabua-de-mares.jpg`);
    expect(ld.mainEntityOfPage['@id']).toBe(`${SITE_URL}/blog/${post.slug}`);
    expect(ld.publisher.name).toBe('Meteor 2.0');
    expect(ld.publisher.logo.url).toBe(`${SITE_URL}/CapaMeteor.jpg`);
    expect(ld.author).toEqual({ '@type': 'Person', name: 'Carlos Alexandre' });
  });

  it('inclui keywords como string separada por vírgula', () => {
    const ld = buildArticleJsonLd(post) as unknown as ArticleLd;
    expect(ld.keywords).toBe(post.keywords.join(', '));
  });

  it('todas as URLs geradas são absolutas (https://)', () => {
    for (const published of BLOG_POSTS.filter(p => p.status === 'published')) {
      const ld = buildArticleJsonLd(published) as unknown as ArticleLd;
      expect(ld.image).toMatch(/^https:\/\//);
      expect(ld.mainEntityOfPage['@id']).toMatch(/^https:\/\//);
    }
  });
});

describe('buildFaqJsonLd', () => {
  it('gera schema FAQPage com uma Question por PAA', () => {
    const ld = buildFaqJsonLd(post) as unknown as FaqLd;

    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity).toHaveLength(post.faq!.length);
    for (const entity of ld.mainEntity) {
      expect(entity['@type']).toBe('Question');
      expect(entity.name.endsWith('?')).toBe(true);
      expect(entity.acceptedAnswer['@type']).toBe('Answer');
      expect(entity.acceptedAnswer.text.length).toBeGreaterThan(80);
    }
  });

  it('retorna null para posts sem FAQ (coming-soon)', () => {
    for (const soon of comingSoonPosts()) {
      expect(buildFaqJsonLd(soon)).toBeNull();
    }
  });
});

describe('serializeJsonLd', () => {
  it('escapa "<" para impedir injeção de </script>', () => {
    const raw = serializeJsonLd({ text: '</script><script>alert(1)</script>' });
    expect(raw).not.toContain('</script>');
    expect(raw).toContain('\\u003c');
  });

  it('produz JSON válido que pode ser parseado de volta', () => {
    const ld = buildArticleJsonLd(post);
    expect(JSON.parse(serializeJsonLd(ld))).toEqual(ld);
  });

  it('escapa a tag sem quebrar o JSON', () => {
    const out = serializeJsonLd({ a: '<b>ok</b>' });
    expect(JSON.parse(out)).toEqual({ a: '<b>ok</b>' });
  });
});
