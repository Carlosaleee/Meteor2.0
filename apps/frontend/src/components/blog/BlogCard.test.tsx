import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogCard, formatBlogDate } from './BlogCard';
import { BLOG_POSTS } from '@/data/blog-posts';

const published = BLOG_POSTS.find(p => p.slug === 'tabua-de-mares-ilha-comprida-cananeia')!;
const comingSoon = BLOG_POSTS.find(p => p.slug === 'surf-peruibe-spots-guia')!;

describe('formatBlogDate', () => {
  it('converte ISO para DD/MM/YYYY sem deslocar o dia', () => {
    expect(formatBlogDate('2026-09-05')).toBe('05/09/2026');
    expect(formatBlogDate('2026-11-06')).toBe('06/11/2026');
  });
});

describe('BlogCard — post publicado', () => {
  it('renderiza capa, badge de categoria, data, readTime e título', () => {
    render(<BlogCard post={published} />);

    expect(screen.getByText(published.title)).toBeInTheDocument();
    expect(screen.getByText(published.category)).toBeInTheDocument();
    expect(screen.getByText('05/09/2026')).toBeInTheDocument();
    expect(screen.getByText(published.readTime)).toBeInTheDocument();
  });

  it('usa a imagem com alt descritivo', () => {
    render(<BlogCard post={published} />);
    const img = screen.getByAltText(published.imageAlt);
    expect(img).toBeInTheDocument();
    // next/image reescreve o src para /_next/image?url=%2Fblog%2F...
    expect(decodeURIComponent(img.getAttribute('src') ?? '')).toContain('/blog/tabua-de-mares.jpg');
  });

  it('linka para a rota dinâmica /blog/[slug]', () => {
    render(<BlogCard post={published} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/blog/${published.slug}`);
    expect(screen.getByText('Ler artigo completo')).toBeInTheDocument();
  });

  it('não renderiza badge "Em breve"', () => {
    render(<BlogCard post={published} />);
    expect(screen.queryByText('Em breve')).not.toBeInTheDocument();
  });
});

describe('BlogCard — coming-soon', () => {
  it('renderiza sem link e com badge "Em breve"', () => {
    render(<BlogCard post={comingSoon} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Em breve')).toBeInTheDocument();
    expect(screen.getByText('Artigo em produção')).toBeInTheDocument();
    expect(screen.getByText(comingSoon.title)).toBeInTheDocument();
  });

  it('continua exibindo categoria, data e readTime', () => {
    render(<BlogCard post={comingSoon} />);
    expect(screen.getByText(comingSoon.category)).toBeInTheDocument();
    expect(screen.getByText('07/11/2026')).toBeInTheDocument();
    expect(screen.getByText(comingSoon.readTime)).toBeInTheDocument();
  });
});
