import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogContent } from './BlogContent';
import { getPostBySlug } from '@/data/blog-posts';
import type { BlogPost } from '@/types/blog';

const post = getPostBySlug('tabua-de-mares-ilha-comprida-cananeia')!;

const fixture: BlogPost = {
  ...post,
  content: [
    { type: 'answer', text: 'Resposta direta com **destaque** e rota /swell?tab=forecast no meio.' },
    { type: 'h2', text: 'Título de Seção' },
    { type: 'h3', text: 'Subtítulo' },
    { type: 'p', text: 'Parágrafo simples.' },
    { type: 'ul', items: ['Item um', 'Item dois com **negrito**'] },
    {
      type: 'table',
      headers: ['Col A', 'Col B'],
      rows: [
        ['a1', 'b1'],
        ['a2', 'b2'],
      ],
    },
    { type: 'callout', tone: 'alert', title: 'Atenção', text: 'Texto do alerta.' },
    { type: 'quote', text: 'Citação de teste.', cite: 'Autor' },
  ],
  faq: [
    { q: 'Primeira pergunta?', a: 'Resposta longa o suficiente para passar no teste de conteúdo do FAQ da página do artigo.' },
    { q: 'Segunda pergunta?', a: 'Outra resposta longa o suficiente para passar no teste de conteúdo do FAQ da página do artigo.' },
  ],
};

describe('BlogContent — blocos tipados', () => {
  it('renderiza o bloco answer com marcação de GEO', () => {
    render(<BlogContent post={fixture} />);
    const answer = screen.getByTestId('geo-answer');
    expect(answer).toHaveTextContent('Resposta direta');
  });

  it('renderiza headings h2 e h3', () => {
    render(<BlogContent post={fixture} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Título de Seção' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Subtítulo' })).toBeInTheDocument();
  });

  it('renderiza parágrafo e lista', () => {
    render(<BlogContent post={fixture} />);
    expect(screen.getByText('Parágrafo simples.')).toBeInTheDocument();
    expect(screen.getByText('Item um')).toBeInTheDocument();
    expect(screen.getAllByRole('list').length).toBeGreaterThan(0);
    // 2 itens do bloco ul + 4 relatedLinks
    expect(screen.getAllByRole('listitem')).toHaveLength(2 + fixture.relatedLinks.length);
  });

  it('renderiza **negrito** como <strong> sem HTML cru', () => {
    render(<BlogContent post={fixture} />);
    expect(screen.getByText('destaque').tagName).toBe('STRONG');
    expect(screen.getByText('negrito').tagName).toBe('STRONG');
  });

  it('converte rotas do texto em links internos reais', () => {
    render(<BlogContent post={fixture} />);
    const link = screen.getByRole('link', { name: '/swell?tab=forecast' });
    expect(link).toHaveAttribute('href', '/swell?tab=forecast');
  });

  it('renderiza tabela com cabeçalhos e células', () => {
    render(<BlogContent post={fixture} />);
    expect(screen.getByRole('columnheader', { name: 'Col A' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'b2' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // thead + 2 linhas
  });

  it('renderiza callout com tom e título', () => {
    render(<BlogContent post={fixture} />);
    expect(screen.getByText('Atenção')).toBeInTheDocument();
    expect(screen.getByText('Texto do alerta.')).toBeInTheDocument();
  });

  it('renderiza citação com autor', () => {
    render(<BlogContent post={fixture} />);
    expect(screen.getByText('Citação de teste.')).toBeInTheDocument();
    expect(screen.getByText('— Autor')).toBeInTheDocument();
  });
});

describe('BlogContent — FAQ e links de saída', () => {
  it('renderiza o FAQ completo (pergunta + resposta)', () => {
    render(<BlogContent post={fixture} />);
    expect(screen.getByRole('heading', { level: 2, name: /People Also Ask/ })).toBeInTheDocument();
    expect(screen.getByText('Primeira pergunta?')).toBeInTheDocument();
    expect(screen.getByText(/Resposta longa o suficiente/)).toBeInTheDocument();
    expect(screen.getByText('Segunda pergunta?')).toBeInTheDocument();
  });

  it('renderiza os relatedLinks como âncoras com href real', () => {
    render(<BlogContent post={fixture} />);
    for (const link of post.relatedLinks) {
      expect(screen.getByRole('link', { name: `${link.label} →` })).toHaveAttribute(
        'href',
        link.href
      );
    }
  });

  it('renderiza o conteúdo real de um post publicado', () => {
    render(<BlogContent post={post} />);
    expect(screen.getByTestId('geo-answer')).toHaveTextContent('atraso hidrográfico');
    expect(screen.getByRole('heading', { level: 2, name: /Sizígia/ })).toBeInTheDocument();
    expect(screen.getByText(/Qual a diferença na tábua de marés/)).toBeInTheDocument();
  });
});
