import { Test, TestingModule } from '@nestjs/testing';
import { NoticiasRegionaisService } from './noticias-regionais.service';
import { NoticiasRegionaisRepository } from './noticias-regionais.repository';

describe('NoticiasRegionaisService', () => {
  let service: NoticiasRegionaisService;

  const mockNoticiasRegionaisRepository = {
    getData: jest.fn().mockResolvedValue({
      news: [
        { id: '1', title: 'Notícia Teste', category: 'noticia', source: 'Fonte Teste' },
        { id: '2', title: 'Trânsito Teste', category: 'transito', source: 'Fonte Teste' },
      ],
      routes: [
        { id: 'sp-222', name: 'SP-222', condition: 'LIVRE' },
      ],
      timestamp: new Date().toISOString(),
    }),
    getNewsByCategory: jest.fn().mockResolvedValue([
      { id: '1', title: 'Notícia Teste', category: 'noticia' },
    ]),
    getRoutes: jest.fn().mockResolvedValue([
      { id: 'sp-222', name: 'SP-222', condition: 'LIVRE' },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticiasRegionaisService,
        { provide: NoticiasRegionaisRepository, useValue: mockNoticiasRegionaisRepository },
      ],
    }).compile();

    service = module.get<NoticiasRegionaisService>(NoticiasRegionaisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getData', () => {
    it('should return news and routes', async () => {
      const result = await service.getData();
      expect(result.news).toHaveLength(2);
      expect(result.routes).toHaveLength(1);
    });
  });

  describe('getNewsByCategory', () => {
    it('should filter by category', async () => {
      const result = await service.getNewsByCategory('noticia');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('noticia');
    });
  });

  describe('getRoutes', () => {
    it('should return traffic routes', async () => {
      const result = await service.getRoutes();
      expect(result).toHaveLength(1);
    });
  });
});
