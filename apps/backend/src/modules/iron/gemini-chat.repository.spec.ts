import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiChatRepository } from './gemini-chat.repository';
import { GeminiClientService } from '../../common/ai/gemini-client.service';

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

  const mockGeminiClient = {
    generateText: jest.fn().mockResolvedValue(null),
    embed: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiChatRepository,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: GeminiClientService, useValue: mockGeminiClient },
      ],
    }).compile();

    repository = module.get<GeminiChatRepository>(GeminiChatRepository);
    jest.clearAllMocks();
    mockGeminiClient.generateText.mockResolvedValue(null);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('chat', () => {
    it('should return fallback when Gemini returns null (no API key)', async () => {
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

    it('should send persona via systemInstruction and data as first user turn', async () => {
      mockGeminiClient.generateText.mockResolvedValue('Resposta tática longa do Irons');

      const result = await repository.chat('como está o tempo?', {
        weather: { temperature: 25, humidity: 70, windSpeed: 12, description: 'Limpo' },
      });

      expect(result).toBe('Resposta tática longa do Irons');
      const call = mockGeminiClient.generateText.mock.calls[0][0];
      expect(call.systemInstruction).toContain('Irons');
      expect(call.contents[0].role).toBe('user');
      expect(call.contents[0].parts[0].text).toContain('CLIMA ATUAL');
      expect(call.contents[0].parts[0].text).toContain('25');
      expect(call.contents[call.contents.length - 1].parts[0].text).toBe('como está o tempo?');
    });

    it('should map history turns to structured content (assistant -> model)', async () => {
      mockGeminiClient.generateText.mockResolvedValue('Resposta tática longa do Irons');

      await repository.chat('e amanhã?', { weather: { temperature: 25, humidity: 70, windSpeed: 12, description: 'Limpo' } }, [
        { role: 'user', content: 'como está o tempo?' },
        { role: 'assistant', content: 'Está limpo, 25°C.' },
      ]);

      const call = mockGeminiClient.generateText.mock.calls[0][0];
      expect(call.contents).toHaveLength(4);
      expect(call.contents[1]).toEqual({ role: 'user', parts: [{ text: 'como está o tempo?' }] });
      expect(call.contents[2]).toEqual({ role: 'model', parts: [{ text: 'Está limpo, 25°C.' }] });
      expect(call.contents[3]).toEqual({ role: 'user', parts: [{ text: 'e amanhã?' }] });
    });

    it('should cap history at 20 turns (oldest dropped)', async () => {
      mockGeminiClient.generateText.mockResolvedValue('Resposta tática longa do Irons');

      const history = Array.from({ length: 30 }, (_, i) => ({
        role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: `msg ${i}`,
      }));

      await repository.chat('nova pergunta', {}, history);

      const call = mockGeminiClient.generateText.mock.calls[0][0];
      // 1 contexto + 20 turns + 1 mensagem atual
      expect(call.contents).toHaveLength(22);
      expect(call.contents[1].parts[0].text).toBe('msg 10');
    });

    it('should fall back when Gemini returns a very short text', async () => {
      mockGeminiClient.generateText.mockResolvedValue('ok');
      const result = await repository.chat('oi', {});
      expect(result).toContain('Irons');
    });
  });
});
