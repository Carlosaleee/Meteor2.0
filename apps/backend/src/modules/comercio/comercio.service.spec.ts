import { Test, TestingModule } from '@nestjs/testing';
import { ComercioService } from './comercio.service';
import { ComercioRepository } from './comercio.repository';

describe('ComercioService', () => {
  let service: ComercioService;

  const mockComercioRepository = {
    getComercioData: jest.fn().mockReturnValue({
      commerce: [
        { id: '1', name: 'Restaurante Teste', sector: 'Alimentação', address: 'Rua A' },
        { id: '2', name: 'Hotel Teste', sector: 'Hospedagem', address: 'Rua B' },
        { id: '3', name: 'Loja Teste', sector: 'Comércio', address: 'Rua C' },
      ],
      timestamp: new Date().toISOString(),
    }),
    getCommerceBySector: jest.fn().mockReturnValue([
      { id: '1', name: 'Restaurante Teste', sector: 'Alimentação', address: 'Rua A' },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComercioService,
        { provide: ComercioRepository, useValue: mockComercioRepository },
      ],
    }).compile();

    service = module.get<ComercioService>(ComercioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getComercioData', () => {
    it('should return commerce data', () => {
      const result = service.getComercioData();
      expect(result.commerce).toHaveLength(3);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getAllCommerce', () => {
    it('should return all commerce items', () => {
      const result = service.getAllCommerce();
      expect(result).toHaveLength(3);
    });
  });

  describe('getCommerceBySector', () => {
    it('should filter by sector', () => {
      const result = service.getCommerceBySector('Alimentação');
      expect(result).toHaveLength(1);
      expect(result[0].sector).toBe('Alimentação');
    });
  });
});
