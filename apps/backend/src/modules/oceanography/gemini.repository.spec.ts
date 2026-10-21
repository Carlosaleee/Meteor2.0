import { Test, TestingModule } from '@nestjs/testing';
import { GeminiRepository } from './gemini.repository';
import { GeminiClientService } from '../../common/ai/gemini-client.service';

describe('GeminiRepository', () => {
  let repository: GeminiRepository;

  const mockGeminiClient = {
    generateText: jest.fn().mockResolvedValue(null),
    embed: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiRepository,
        { provide: GeminiClientService, useValue: mockGeminiClient },
      ],
    }).compile();

    repository = module.get<GeminiRepository>(GeminiRepository);
    jest.clearAllMocks();
    mockGeminiClient.generateText.mockResolvedValue(null);
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

    it('should return fallback summary when Gemini unavailable', async () => {
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

    it('should use Gemini when it returns a valid summary', async () => {
      mockGeminiClient.generateText.mockResolvedValueOnce('Resposta tática completa do Gemini sobre as condições marítimas.');
      const result = await repository.generateSummary(mockData);
      expect(result).toBe('Resposta tática completa do Gemini sobre as condições marítimas.');
      expect(mockGeminiClient.generateText).toHaveBeenCalledWith(
        expect.objectContaining({ maxOutputTokens: 2500 }),
      );
    });
  });
});
