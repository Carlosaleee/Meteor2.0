import { Test, TestingModule } from '@nestjs/testing';
import { TrafficService } from './traffic.service';
import { TrafficRepository } from './traffic.repository';

describe('TrafficService', () => {
  let service: TrafficService;

  const mockTrafficRepository = {
    getTrafficStatus: jest.fn().mockResolvedValue({
      timestamp: new Date().toISOString(),
      location: 'Vale do Ribeira',
      routes: [
        { id: 'sp-222', name: 'SP-222', condition: 'LIVRE', stretch: 'Iguape', waitTimeMinutes: undefined },
        { id: 'br-116', name: 'BR-116', condition: 'MODERADO', stretch: 'Registro', waitTimeMinutes: 15 },
      ],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrafficService,
        { provide: TrafficRepository, useValue: mockTrafficRepository },
      ],
    }).compile();

    service = module.get<TrafficService>(TrafficService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTraffic', () => {
    it('should return traffic data', async () => {
      const result = await service.getTraffic();
      expect(result.routes).toHaveLength(2);
      expect(result.location).toBe('Vale do Ribeira');
    });

    it('should include route conditions', async () => {
      const result = await service.getTraffic();
      expect(result.routes[0].condition).toBe('LIVRE');
      expect(result.routes[1].condition).toBe('MODERADO');
    });

    it('should include timestamp', async () => {
      const result = await service.getTraffic();
      expect(result.timestamp).toBeDefined();
    });
  });
});
