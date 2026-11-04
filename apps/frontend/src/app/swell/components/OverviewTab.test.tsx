import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverviewTab, pickOverviewNews } from './OverviewTab';
import type { OceanographyResponse, NewsItem, NewsResponse } from '@/lib/api';

const mkNews = (id: string, category: 'WSL' | 'Paulista'): NewsItem => ({
  id,
  title: `Notícia ${id}`,
  source: category === 'WSL' ? 'WSL' : 'SPSurf',
  sourceUrl: 'https://example.com',
  url: `https://example.com/${id}`,
  description: 'Descrição de teste.',
  image: '',
  category,
  publishedAt: '2026-11-03T12:00:00.000Z',
});

// Ordem real de produção: Paulista primeiro (o corte antigo de 4 itens + filtro
// WSL renderizava 0 cards justamente por isso).
const newsFeed: NewsItem[] = [
  mkNews('paulista-1', 'Paulista'),
  mkNews('paulista-2', 'Paulista'),
  mkNews('paulista-3', 'Paulista'),
  mkNews('paulista-4', 'Paulista'),
  mkNews('wsl-1', 'WSL'),
  mkNews('wsl-2', 'WSL'),
  mkNews('wsl-3', 'WSL'),
  mkNews('wsl-4', 'WSL'),
];

const data: OceanographyResponse = {
  location: 'Ubatuba',
  timestamp: '2026-11-03T12:00:00.000Z',
  current: {
    waveHeight: 1.2,
    wavePeriod: 10,
    waveDirection: 90,
    swellHeight: 1.0,
    swellPeriod: 9,
    swellDirection: 100,
    windSpeed: 12,
    windDirection: 45,
    windGust: 18,
  },
  qualityLabel: 'Bom',
  qualityEmoji: '🌊',
  bestTime: '06h-09h',
  nextTide: '14:30',
  tideCoefficient: 0.75,
  spots: [],
};

const newsData: NewsResponse = {
  news: newsFeed,
  rankings: { men: [], women: [] },
  events: [],
  timestamp: '2026-11-03T12:00:00.000Z',
};

describe('pickOverviewNews', () => {
  it('should pick 3 WSL and 3 Paulista regardless of feed order', () => {
    const picked = pickOverviewNews(newsFeed);
    expect(picked).toHaveLength(6);
    expect(picked.filter(n => n.category === 'WSL')).toHaveLength(3);
    expect(picked.filter(n => n.category === 'Paulista')).toHaveLength(3);
    expect(picked.map(n => n.id)).toEqual([
      'wsl-1', 'wsl-2', 'wsl-3', 'paulista-1', 'paulista-2', 'paulista-3',
    ]);
  });

  it('should tolerate missing news', () => {
    expect(pickOverviewNews(undefined)).toEqual([]);
    expect(pickOverviewNews([])).toEqual([]);
  });

  it('should keep what exists when one category is missing', () => {
    const onlyPaulista = newsFeed.filter(n => n.category === 'Paulista');
    const picked = pickOverviewNews(onlyPaulista);
    expect(picked).toHaveLength(3);
    expect(picked.every(n => n.category === 'Paulista')).toBe(true);
  });
});

describe('OverviewTab news section', () => {
  // Timeout generoso: o render monta as 7 secoes (spots, hourly, IA...) e sob
  // carga do suite completo (vitest em paralelo) 5s nao basta — isolado leva ~0.9s.
  it('should render 6 news cards (3 WSL + 3 Paulista) and drop the overflow', { timeout: 30_000 }, () => {
    render(
      <OverviewTab
        data={data}
        hourlyData={null}
        aiData={null}
        newsData={newsData}
        hourlyLoading={false}
        aiLoading={false}
        newsLoading={false}
      />,
    );

    expect(screen.getByText('(6 matérias)')).toBeInTheDocument();
    for (const id of ['wsl-1', 'wsl-2', 'wsl-3', 'paulista-1', 'paulista-2', 'paulista-3']) {
      expect(screen.getByText(`Notícia ${id}`)).toBeInTheDocument();
    }
    expect(screen.queryByText('Notícia wsl-4')).not.toBeInTheDocument();
    expect(screen.queryByText('Notícia paulista-4')).not.toBeInTheDocument();
  });
});
