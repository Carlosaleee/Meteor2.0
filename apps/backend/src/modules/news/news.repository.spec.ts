import { Test, TestingModule } from '@nestjs/testing';
import { NewsRepository } from './news.repository';
import { WslRepository, WslNewsItem } from './wsl.repository';
import { SpsurfRepository, SpsurfNewsItem } from './spsurf.repository';
import { FallbackService } from '../../common/fallback/fallback.service';

describe('NewsRepository', () => {
  let repository: NewsRepository;

  const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

  const liveNews: WslNewsItem[] = [
    {
      title: 'Ryan Kainalo e Charli Hately são os grandes campeões do Banco do Brasil São Sebastião Pro',
      description: 'Dupla brasileira brilhou na final em Maresias.',
      url: 'https://wsllatinamerica.com/ryan-kainalo-e-charli-hately-sao-campeoes/',
      image: 'https://wsllatinamerica.com/wp-content/uploads/a.jpg',
      publishedAt: daysAgo(1),
    },
    {
      title: 'Circuito Challenger Series chega ao Litoral Norte paulista',
      description: 'Etapa decisiva do ranking mundial',
      url: 'https://wsllatinamerica.com/challenger-series-litoral-norte/',
      image: 'https://wsllatinamerica.com/wp-content/uploads/b.jpg',
      publishedAt: daysAgo(2),
    },
  ];

  const spsurfNews: SpsurfNewsItem[] = Array.from({ length: 6 }, (_, i) => ({
    title: `Circuito paulista de surfe etapa ${i + 1}`,
    description: 'Descricao da etapa',
    url: `https://news.google.com/rss/articles/abc${i}?oc=5`,
    publishedAt: daysAgo(i),
    image: '',
  }));

  const rankings = {
    men: [{ rank: 1, name: 'Yago Dora', country: 'Brazil', points: 47525, trend: 0 }],
    women: [{ rank: 1, name: 'Molly Picklum', country: 'Australia', points: 43695, trend: 1 }],
    events: [
      {
        name: 'MEO Rip Curl Pro Portugal',
        location: 'Supertubos, Peniche, Portugal',
        dates: 'Oct 16 - 25',
        status: 'Upcoming' as const,
        tour: 'Championship Tour',
      },
    ],
    fetchedAt: new Date().toISOString(),
  };

  const mockWslRepository = {
    getRankings: jest.fn(),
    getNews: jest.fn(),
    clearCache: jest.fn(),
  };

  const mockSpsurfRepository = {
    getNews: jest.fn(),
    clearCache: jest.fn(),
  };

  const mockFallback = {
    save: jest.fn(),
    load: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockWslRepository.getRankings.mockResolvedValue(rankings);
    mockWslRepository.getNews.mockResolvedValue(liveNews);
    mockSpsurfRepository.getNews.mockResolvedValue(spsurfNews);
    mockFallback.save.mockResolvedValue(undefined);
    mockFallback.load.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsRepository,
        { provide: WslRepository, useValue: mockWslRepository },
        { provide: SpsurfRepository, useValue: mockSpsurfRepository },
        { provide: FallbackService, useValue: mockFallback },
      ],
    }).compile();

    repository = module.get<NewsRepository>(NewsRepository);
  });

  it('should assemble exactly 12 news with both WSL and Paulista categories', async () => {
    const result = await repository.getNewsData();

    expect(result.news).toHaveLength(12);
    const categories = new Set(result.news.map(n => n.category));
    expect(categories).toEqual(new Set(['WSL', 'Paulista']));
    expect(result.rankings.men).toHaveLength(1);
    expect(result.rankings.women).toHaveLength(1);
    expect(result.events).toHaveLength(1);
    expect(result.timestamp).toBeDefined();
  });

  it('should prefer live WSL news from the pt-BR feed over the static list', async () => {
    const result = await repository.getNewsData();

    expect(result.news[0].title).toBe(liveNews[0].title);
    expect(result.news[0]).toMatchObject({
      source: 'WSL Latin America',
      sourceUrl: 'https://wsllatinamerica.com',
      category: 'WSL',
      publishedAt: liveNews[0].publishedAt,
    });
    expect(result.news[0].id.startsWith('wsl-wsllatinamerica-com-')).toBe(true);
    expect(result.news.map(n => n.title)).not.toContain('Miguel Pupo vence Trestles e sobe para 4o do ranking mundial');
  });

  it('should fall back to the static WSL list when the live feed is empty', async () => {
    mockWslRepository.getNews.mockResolvedValue([]);

    const result = await repository.getNewsData();

    expect(result.news.map(n => n.id)).toContain('wsl-trestles-miguel-vence');
    expect(result.news.filter(n => n.category === 'WSL').length).toBeGreaterThanOrEqual(6);
  });

  it('should persist news, rankings and events to the fallback file', async () => {
    await repository.getNewsData();

    expect(mockFallback.save).toHaveBeenCalledTimes(1);
    const [filename, payload] = mockFallback.save.mock.calls[0];
    expect(filename).toBe('fallback-news.json');
    expect(payload.news).toHaveLength(12);
    expect(payload.rankings.men[0].name).toBe('Yago Dora');
    expect(payload.events[0].name).toBe('MEO Rip Curl Pro Portugal');
  });

  it('should refresh the cache when forceRefresh is called', async () => {
    const first = await repository.getNewsData();
    await repository.forceRefresh();
    const second = await repository.getNewsData();

    expect(first).not.toBe(second);
    expect(second.news).toHaveLength(12);
  });
});
