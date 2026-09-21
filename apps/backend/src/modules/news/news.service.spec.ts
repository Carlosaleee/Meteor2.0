import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { NewsRepository } from './news.repository';

describe('NewsService', () => {
  let service: NewsService;

  const mockNewsRepository = {
    getNewsData: jest.fn().mockResolvedValue({
      news: [
        {
          id: 'wsl-trestles-miguel-vence',
          title: 'Miguel Pupo vence Trestles',
          source: 'World Surf League',
          sourceUrl: 'https://www.worldsurfleague.com',
          url: 'https://ne9.com.br/wsl-trestles-miguel-pupo-erin-brooks-ranking/',
          description: 'Miguel Pupo derrotou Kanoa Igarashi na final.',
          image: 'https://example.com/image.jpg',
          category: 'WSL',
          publishedAt: new Date().toISOString(),
        },
        {
          id: 'spsurf-1',
          title: 'Surf Attack 2026 em Maresias',
          source: 'SPSurf',
          sourceUrl: 'https://www.spsurf.com.br',
          url: 'https://www.spsurf.com.br',
          description: 'Etapa decisiva do Ranking Paulista.',
          image: 'https://example.com/image2.jpg',
          category: 'Paulista',
          publishedAt: new Date().toISOString(),
        },
      ],
      rankings: {
        men: [
          { rank: 1, name: 'Yago Dora', country: 'Brazil', points: 42780, trend: 2 },
        ],
        women: [
          { rank: 1, name: 'Gabriela Bryan', country: 'Hawaii', points: 42865, trend: 1 },
        ],
      },
      events: [
        {
          name: 'MEO Rip Curl Pro Portugal',
          location: 'Peniche, Portugal',
          dates: '16-25 Out 2026',
          status: 'Upcoming',
          tour: 'Championship Tour',
        },
      ],
      timestamp: new Date().toISOString(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: NewsRepository, useValue: mockNewsRepository },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNews', () => {
    it('should return news, rankings, and events', async () => {
      const result = await service.getNews();
      expect(result.news).toHaveLength(2);
      expect(result.rankings.men).toHaveLength(1);
      expect(result.rankings.women).toHaveLength(1);
      expect(result.events).toHaveLength(1);
    });

    it('should include WSL and Paulista categories', async () => {
      const result = await service.getNews();
      const categories = result.news.map(n => n.category);
      expect(categories).toContain('WSL');
      expect(categories).toContain('Paulista');
    });

    it('should call repository getNewsData', async () => {
      mockNewsRepository.getNewsData.mockClear();
      await service.getNews();
      expect(mockNewsRepository.getNewsData).toHaveBeenCalledTimes(1);
    });
  });
});
