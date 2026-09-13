import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiRepository } from './gemini.repository';

describe('GeminiRepository', () => {
  let repository: GeminiRepository;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        GEMINI_API_KEY: '',
        GEMINI_MODEL: 'gemini-2.5-flash',
        GEMINI_TEMPERATURE: '0.7',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiRepository,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    repository = module.get<GeminiRepository>(GeminiRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('generateSummary', () => {
    const mockData = {
      waveHeight: 1.2,
      wavePeriod: 10,
      waveDirection: 150,
      swellHeight: 1.0,
      swellPeriod: 12,
      swellDirection: 160,
      windSpeed: 12,
      windDirection: 180,
      windGust: 18,
      qualityLabel: 'Boas',
      bestTime: '08:00 - 11:00',
      nextTide: '14:30',
      tideCoefficient: 0.78,
    };

    it('should return fallback summary when no API key', async () => {
      const result = await repository.generateSummary(mockData);
      expect(result).toContain('Condições');
      expect(result).toContain('Vento');
    });

    it('should include wave data in fallback', async () => {
      const result = await repository.generateSummary(mockData);
      expect(result).toContain('1.2m');
    });

    it('should include wind analysis in fallback', async () => {
      const result = await repository.generateSummary(mockData);
      expect(result).toContain('ONSHORE');
    });
  });
});
