import { Test, TestingModule } from '@nestjs/testing';
import { GeminiChatRepository } from './gemini-chat.repository';
import { ConfigService } from '@nestjs/config';

describe('GeminiChatRepository', () => {
  let repository: GeminiChatRepository;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'GEMINI_API_KEY') return undefined;
      if (key === 'GEMINI_MODEL') return 'gemini-2.5-flash';
      if (key === 'GEMINI_TEMPERATURE') return 0.7;
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiChatRepository,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    repository = module.get<GeminiChatRepository>(GeminiChatRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('chat', () => {
    it('should return fallback when no API key', async () => {
      const result = await repository.chat('oi', {});
      expect(result).toContain('Irons');
    });

    it('should return weather info in fallback', async () => {
      const context = {
        weather: { temperature: 25, humidity: 70, windSpeed: 12, description: 'Limpo' },
      };
      const result = await repository.chat('como está o tempo?', context);
      expect(result).toContain('25');
    });

    it('should return surf info in fallback', async () => {
      const context = {
        ocean: { waveHeight: 1.2, qualityLabel: 'Boas', bestTime: '08:00', nextTide: '14:30' },
      };
      const result = await repository.chat('como estão as ondas?', context);
      expect(result).toContain('1.2');
    });

    it('should return traffic info in fallback', async () => {
      const context = {
        traffic: { routes: [{ name: 'SP-222', condition: 'LIVRE' }] },
      };
      const result = await repository.chat('como está o trânsito?', context);
      expect(result).toContain('SP-222');
    });

    it('should return rankings info in fallback', async () => {
      const context = {
        rankings: {
          men: [{ rank: 1, name: 'Yago Dora', country: 'Brazil', points: 42000 }],
          women: [{ rank: 1, name: 'Gabriela Bryan', country: 'Hawaii', points: 40000 }],
          events: [{ name: 'Portugal Pro', location: 'Peniche', dates: '16-25 Out', status: 'Upcoming' }],
        },
      };
      const result = await repository.chat('qual o ranking wsl?', context);
      expect(result).toContain('Yago Dora');
    });
  });
});
