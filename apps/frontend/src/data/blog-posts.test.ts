import { describe, it, expect } from 'vitest';
import { BLOG_POSTS, publishedPosts, comingSoonPosts, getPostBySlug } from './blog-posts';
import type { BlogBlock, BlogPost } from '@/types/blog';

/** Rotas reais do app (7 telas) + slugs publicados internos — mapa de links binding. */
const ALLOWED_HREFS = new Set([
  '/',
  '/meteorologia',
  '/swell',
  '/swell?tab=forecast',
  '/swell?tab=spots',
  '/noticias',
  '/noticias#rodovias',
  '/comercio',
  '/blog',
  '/creditos',
  '/blog/tabua-de-mares-ilha-comprida-cananeia',
  '/blog/reserva-de-cananeia-manguezais-lagamar',
  '/blog/jureia-itinga-praias-surf-ecoturismo',
  '/blog/ilha-comprida-mar-de-dentro-oceano',
  '/blog/ventos-de-sudeste-o-que-esperar-no-inverno',
  '/blog/dinamica-costeira-vale-do-ribeira',
  '/blog/el-nino-2026-litoral-sul-sp',
  '/blog/baleias-jubarte-litoral-sao-paulo',
  '/blog/ilha-do-cardoso-guia-ecoturismo',
  '/blog/caverna-do-diabo-guia-visita',
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function collectHrefs(post: BlogPost): string[] {
  const fromLinks = post.relatedLinks.map(l => l.href);
  const fromBlocks = post.content.flatMap(b => {
    if (b.type !== 'p' && b.type !== 'answer' && b.type !== 'callout') return [];
    // Só rotas reais do app (evita falso positivo em prosa tipo "Iguape/Cananéia").
    const matches =
      b.text.match(/\/(meteorologia|swell|noticias|comercio|blog|creditos)(\?[a-z=&]+)?(#[a-z-]+)?/g) ?? [];
    return matches;
  });
  return [...fromLinks, ...fromBlocks];
}

describe('blog-posts — base de conteúdos', () => {
  it('tem 12 posts: 10 publicados e 2 coming-soon', () => {
    expect(BLOG_POSTS).toHaveLength(12);
    expect(publishedPosts()).toHaveLength(10);
    expect(comingSoonPosts()).toHaveLength(2);
  });

  it('slugs são únicos e em kebab-case', () => {
    const slugs = BLOG_POSTS.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(BLOG_POSTS.map(p => [p.slug, p] as const))(
    'campos obrigatórios preenchidos em %s',
    (_slug, post) => {
      expect(post.title.length).toBeGreaterThan(10);
      expect(post.summary.length).toBeGreaterThan(30);
      expect(post.date).toMatch(ISO_DATE);
      expect(post.readTime).toMatch(/\d+ min/);
      expect(post.imageUrl.startsWith('/blog/')).toBe(true);
      expect(post.imageAlt.length).toBeGreaterThan(10);
      expect(post.author).toBe('Carlos Alexandre');
      expect(post.keywords.length).toBeGreaterThanOrEqual(3);
      expect(post.relatedLinks.length).toBeGreaterThanOrEqual(2);
    }
  );

  it('metaTitle ≤ 60 caracteres (SEO) e description entre 150 e 160', () => {
    for (const post of BLOG_POSTS) {
      expect(post.metaTitle.length, `metaTitle de ${post.slug}`).toBeLessThanOrEqual(60);
      expect(post.description.length, `description de ${post.slug}`).toBeGreaterThanOrEqual(150);
      expect(post.description.length, `description de ${post.slug}`).toBeLessThanOrEqual(160);
    }
  });

  it('posts publicados têm conteúdo e FAQ com resposta escrita', () => {
    for (const post of publishedPosts()) {
      expect(post.content.length, `content de ${post.slug}`).toBeGreaterThan(0);
      expect(post.faq?.length, `faq de ${post.slug}`).toBeGreaterThanOrEqual(3);
      for (const item of post.faq ?? []) {
        expect(item.q.endsWith('?'), `pergunta sem interrogação: ${item.q}`).toBe(true);
        expect(item.a.length, `resposta curta demais: ${item.q}`).toBeGreaterThan(80);
      }
    }
  });

  it('posts coming-soon não têm conteúdo nem FAQ', () => {
    for (const post of comingSoonPosts()) {
      expect(post.content).toHaveLength(0);
      expect(post.faq).toBeUndefined();
    }
  });

  it('todo bloco é um BlogBlock válido', () => {
    const validTypes = new Set(['answer', 'p', 'h2', 'h3', 'ul', 'table', 'callout', 'quote']);
    for (const post of BLOG_POSTS) {
      for (const block of post.content as BlogBlock[]) {
        expect(validTypes.has(block.type), `tipo inválido: ${block.type}`).toBe(true);
        if (block.type === 'ul') expect(block.items.length).toBeGreaterThan(0);
        if (block.type === 'table') {
          expect(block.headers.length).toBeGreaterThan(1);
          expect(block.rows.length).toBeGreaterThan(0);
          for (const row of block.rows) expect(row.length).toBe(block.headers.length);
        }
      }
    }
  });

  it('todos os links internos apontam para rotas reais (nenhum link morto)', () => {
    for (const post of BLOG_POSTS) {
      for (const href of collectHrefs(post)) {
        expect(ALLOWED_HREFS.has(href), `link morto em ${post.slug}: ${href}`).toBe(true);
      }
    }
  });

  it('nenhum artigo aponta para rota inexistente do mapa de correção', () => {
    const forbidden = ['/meteorologia?tab=tides', '/spots/ilha-comprida', '/rodovias'];
    for (const post of BLOG_POSTS) {
      for (const href of collectHrefs(post)) {
        expect(forbidden, `rota proibida em ${post.slug}`).not.toContain(href);
      }
    }
  });

  it('getPostBySlug retorna apenas posts publicados', () => {
    expect(getPostBySlug('tabua-de-mares-ilha-comprida-cananeia')?.status).toBe('published');
    expect(getPostBySlug('el-nino-2026-litoral-sul-sp')?.status).toBe('published');
    expect(getPostBySlug('surf-peruibe-spots-guia')).toBeUndefined();
    expect(getPostBySlug('slug-que-nao-existe')).toBeUndefined();
  });

  it('publishedPosts ordena por data decrescente', () => {
    const dates = publishedPosts().map(p => p.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });
});
