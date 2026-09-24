import { Test, TestingModule } from '@nestjs/testing';
import { NoticiasRegionaisRepository, RegionalNewsItem } from './noticias-regionais.repository';
import { FallbackService } from '../../common/fallback/fallback.service';

describe('NoticiasRegionaisRepository', () => {
  let repository: NoticiasRegionaisRepository;

  const sampleRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ISN Online</title>
    <item>
      <title><![CDATA[Chuva provoca alagamentos em Registro e transito travado na SP-165]]></title>
      <link>https://isnonline.com.br/2026/09/24/chuva-registro/</link>
      <description><![CDATA[<p>Alagamentos causaram lentidao na regiao.</p>]]></description>
      <pubDate>Wed, 24 Sep 2026 10:00:00 GMT</pubDate>
      <media:content url="https://img.example.com/chuva.jpg" />
    </item>
    <item>
      <title>Enchente atinge comunidades no Vale do Ribeira</title>
      <link>https://isnonline.com.br/2026/09/23/enchente-vale/</link>
      <description>Familias desalojadas em Eldorado.</description>
      <pubDate>Tue, 23 Sep 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Curta</title>
      <link>https://isnonline.com.br/curta</link>
      <description>Titulo curto demais deve ser ignorado.</description>
      <pubDate>Tue, 23 Sep 2026 07:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

  const baseItem: RegionalNewsItem = {
    id: 'reg-001',
    title: 'Chuva provoca alagamentos em Registro e transito travado na SP-165',
    source: 'G1 Santos',
    sourceUrl: 'https://g1.globo.com/sp/santos-regiao/',
    url: 'https://g1.globo.com/sp/santos-regiao/noticia/2026/09/14/chuva.ghtml',
    description: 'Noticia antiga do arquivo base.',
    image: '',
    category: 'noticia',
    publishedAt: '2026-09-14T16:21:00.000Z',
  };

  const baseRoute = {
    id: 'sp-222',
    name: 'SP-222',
    condition: 'MODERADO',
    description: 'Fluxo intenso',
    updatedAt: '2026-09-21T12:00:00.000Z',
  };

  const mockFallback = {
    load: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    mockFallback.load.mockResolvedValue({ news: [baseItem], routes: [baseRoute] });
    mockFallback.save.mockResolvedValue(undefined);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(sampleRss),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticiasRegionaisRepository,
        { provide: FallbackService, useValue: mockFallback },
      ],
    }).compile();

    repository = module.get<NoticiasRegionaisRepository>(NoticiasRegionaisRepository);
    jest.clearAllMocks();
    mockFallback.load.mockResolvedValue({ news: [baseItem], routes: [baseRoute] });
    mockFallback.save.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getData', () => {
    it('should scrape RSS items with parsed fields', async () => {
      const result = await repository.getData();

      const scraped = result.news.find(n => n.title.includes('Enchente atinge comunidades'));
      expect(scraped).toBeDefined();
      expect(scraped!.source).toBe('ISN Online');
      expect(scraped!.url).toBe('https://isnonline.com.br/2026/09/23/enchente-vale/');
      expect(scraped!.publishedAt).toBe('2026-09-23T08:00:00.000Z');
      expect(scraped!.description).toBe('Familias desalojadas em Eldorado.');
    });

    it('should classify categories by keywords', async () => {
      const result = await repository.getData();
      const traffic = result.news.find(n => n.title.includes('SP-165'));
      expect(traffic).toBeDefined();
      expect(traffic!.category).toBe('transito');
      const general = result.news.find(n => n.title.includes('Enchente atinge'));
      expect(general!.category).toBe('noticia');
    });

    it('should extract media image from RSS item', async () => {
      const result = await repository.getData();
      const withImage = result.news.find(n => n.title.includes('SP-165'));
      expect(withImage!.image).toBe('https://img.example.com/chuva.jpg');
    });

    it('should keep routes from the fallback file', async () => {
      const result = await repository.getData();
      expect(result.routes).toHaveLength(1);
      expect(result.routes[0].id).toBe('sp-222');
    });

    it('should deduplicate scraped items against base file items', async () => {
      const result = await repository.getData();
      const duplicates = result.news.filter(n => n.title.includes('SP-165'));
      expect(duplicates).toHaveLength(1);
      expect(result.news).toHaveLength(2);
    });

    it('should persist merged news back to the fallback file', async () => {
      await repository.getData();
      expect(mockFallback.save).toHaveBeenCalledTimes(1);
      const call = mockFallback.save.mock.calls[0] as unknown as [string, { news: RegionalNewsItem[]; routes: unknown[] }];
      expect(call[0]).toBe('fallback-noticias-regionais.json');
      expect(call[1].routes).toHaveLength(1);
      expect(call[1].news).toHaveLength(2);
    });

    it('should fall back to file data when all sources fail', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

      const result = await repository.getData();
      expect(result.news).toHaveLength(1);
      expect(result.news[0].title).toBe(baseItem.title);
      expect(result.routes).toHaveLength(1);
      expect(mockFallback.save).not.toHaveBeenCalled();
    });

    it('should cache results between calls', async () => {
      await repository.getData();
      await repository.getData();
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('forceRefresh', () => {
    it('should clear cache and refetch', async () => {
      await repository.getData();
      await repository.forceRefresh();
      expect(global.fetch).toHaveBeenCalledTimes(6);
    });
  });

  describe('getNewsByCategory', () => {
    it('should filter by category or return all for todas', async () => {
      const all = await repository.getNewsByCategory('todas');
      expect(all).toHaveLength(2);
      const traffic = await repository.getNewsByCategory('transito');
      expect(traffic).toHaveLength(1);
      expect(traffic[0].category).toBe('transito');
    });
  });
});
