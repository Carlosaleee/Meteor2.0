import { Test, TestingModule } from '@nestjs/testing';
import { WslRepository } from './wsl.repository';

describe('WslRepository', () => {
  let repository: WslRepository;

  const mockRankingHtml = `
    <table><tr><td>1</td><td>Yago Dora</td><td>BRA</td><td>42000</td></tr></table>
  `;

  const mockEventsHtml = `
    <div class="event"><h3>Portugal Pro</h3><p>Peniche</p><p>16-25 Out</p></div>
  `;

  beforeEach(async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(mockRankingHtml),
      json: jest.fn().mockResolvedValue([]),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [WslRepository],
    }).compile();

    repository = module.get<WslRepository>(WslRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getRankings', () => {
    it('should return rankings data with required fields', async () => {
      const result = await repository.getRankings();
      expect(result.men).toBeDefined();
      expect(result.women).toBeDefined();
      expect(result.events).toBeDefined();
      expect(Array.isArray(result.men)).toBe(true);
      expect(Array.isArray(result.women)).toBe(true);
      expect(Array.isArray(result.events)).toBe(true);
      expect(result.fetchedAt).toBeDefined();
    });

    it('should cache results', async () => {
      const result1 = await repository.getRankings();
      const result2 = await repository.getRankings();
      expect(result1).toBe(result2);
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      await repository.getRankings();
      repository.clearCache();
      const result = await repository.getRankings();
      expect(result).toBeDefined();
      expect(result.fetchedAt).toBeDefined();
    });
  });
});
