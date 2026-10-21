import { Test, TestingModule } from '@nestjs/testing';
import { SpsurfRepository } from './spsurf.repository';

describe('SpsurfRepository', () => {
  let repository: SpsurfRepository;

  beforeEach(async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(`
        <div class="news">
          <h3><a href="/news/1">Teste Notícia</a></h3>
          <p>Descrição da notícia</p>
        </div>
      `),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpsurfRepository],
    }).compile();

    repository = module.get<SpsurfRepository>(SpsurfRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getNews', () => {
    it('should return news data', async () => {
      const result = await repository.getNews();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should cache results', async () => {
      const result1 = await repository.getNews();
      const result2 = await repository.getNews();
      expect(result1).toBe(result2);
    });

    it('should fall back to Google News RSS when the primary source is unreachable', async () => {
      const rss = `
        <rss><channel>
          <item>
            <title>Surfe: Yago Dora e Italo Ferreira avancam em Peniche - Agencia Brasil</title>
            <link>https://news.google.com/rss/articles/abc123?oc=5</link>
            <pubDate>Fri, 16 Oct 2026 22:12:00 GMT</pubDate>
            <description>&lt;a href="https://news.google.com/rss/articles/abc123"&gt;Surfe&lt;/a&gt;Agencia Brasil</description>
            <source url="https://agenciabrasil.ebc.com.br">Agencia Brasil</source>
          </item>
          <item>
            <title>Surf diz que rede propria servira para ampliar servicos de MVNOs parceiras - TeleSintese</title>
            <link>https://news.google.com/rss/articles/def456?oc=5</link>
            <pubDate>Wed, 14 Oct 2026 21:55:00 GMT</pubDate>
            <source url="https://telesintese.com.br">TeleSintese</source>
          </item>
        </channel></rss>
      `;

      global.fetch = jest.fn().mockImplementation((url: string) =>
        String(url).includes('news.google.com')
          ? Promise.resolve({ ok: true, text: () => Promise.resolve(rss) })
          : Promise.reject(new Error('Could not resolve host: www.spsurf.com.br')),
      );

      const result = await repository.getNews();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Surfe: Yago Dora e Italo Ferreira avancam em Peniche');
      expect(result[0].url).toBe('https://news.google.com/rss/articles/abc123?oc=5');
      expect(result[0].publishedAt).toBe('2026-10-16T22:12:00.000Z');
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      await repository.getNews();
      repository.clearCache();
      const result = await repository.getNews();
      expect(result).toBeDefined();
    });
  });
});
