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
