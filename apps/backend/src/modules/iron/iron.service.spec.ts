import { Test, TestingModule } from '@nestjs/testing';
import { IronService } from './iron.service';
import { MeteorologyService } from '../meteorology/meteorology.service';
import { OceanographyService } from '../oceanography/oceanography.service';
import { TrafficService } from '../traffic/traffic.service';
import { ComercioService } from '../comercio/comercio.service';
import { NoticiasRegionaisService } from '../noticias-regionais/noticias-regionais.service';
import { NewsRepository } from '../news/news.repository';
import { WeatherNewsRepository } from '../meteorology/weather-news.repository';
import { GeminiContextBuilder } from '../../common/ai/GeminiContextBuilder';
import { GeminiChatRepository, ChatTurn } from './gemini-chat.repository';
import { RagService } from './rag/rag.service';

describe('IronService', () => {
  let service: IronService;

  const mockMeteorologyService = {
    getCurrentWeather: jest.fn().mockResolvedValue({
      location: 'Ilha Comprida',
      current: {
        temperature: 25,
        apparentTemperature: 27,
        humidity: 70,
        windSpeed: 12,
        windDirection: 180,
        pressure: 1013,
        precipitation: 0,
        weatherCode: 1,
      },
      hourly: [
        { time: new Date().toISOString(), temperature: 25, windSpeed: 12, precipitationProbability: 10 },
      ],
    }),
  };

  const mockOceanographyService = {
    getSwellConditions: jest.fn().mockResolvedValue({
      current: {
        waveHeight: 1.2,
        wavePeriod: 10,
        waveDirection: 150,
        swellHeight: 1.0,
        swellPeriod: 12,
      },
      qualityLabel: 'Boas',
      bestTime: '08:00 - 11:00',
      nextTide: '14:30',
      tideCoefficient: 0.78,
    }),
  };

  const mockTrafficService = {
    getTraffic: jest.fn().mockResolvedValue({
      routes: [
        { id: 'sp-222', name: 'SP-222', condition: 'LIVRE', stretch: 'Iguape' },
        { id: 'br-116', name: 'BR-116', condition: 'MODERADO', stretch: 'Registro' },
      ],
    }),
  };

  const mockComercioService = {
    getAllCommerce: jest.fn().mockResolvedValue([
      { id: '1', name: 'Restaurante Teste', sector: 'Alimentação', address: 'Rua A' },
      { id: '2', name: 'Hotel Teste', sector: 'Hospedagem', address: 'Rua B' },
    ]),
  };

  const mockNoticiasService = {
    getData: jest.fn().mockResolvedValue({
      news: [
        { id: '1', title: 'Notícia Teste', category: 'noticia' },
      ],
    }),
  };

  const mockNewsRepo = {
    getNewsData: jest.fn().mockResolvedValue({
      news: [
        { id: '1', title: 'WSL News', category: 'WSL' },
      ],
      rankings: {
        men: [{ rank: 1, name: 'Teste', country: 'Brazil', points: 40000 }],
        women: [{ rank: 1, name: 'Teste', country: 'Brazil', points: 35000 }],
      },
      events: [{ name: 'Teste Pro', location: 'SP', dates: '20-25 Set', status: 'Upcoming' }],
    }),
  };

  const mockWeatherNewsRepo = {
    getWeatherNews: jest.fn().mockResolvedValue({
      news: [
        { id: '1', title: 'Alerta Teste', source: 'INMET', type: 'alerta' },
      ],
    }),
  };

  const mockGeminiChat = {
    chat: jest.fn().mockResolvedValue('Resposta do Irons via Gemini'),
  };

  const mockRagService = {
    retrieve: jest.fn().mockResolvedValue([
      {
        chunk: {
          id: 'docs:SYSTEM_SPEC.md:12',
          title: 'SYSTEM_SPEC.md',
          section: 'Chat',
          text: 'O Irons responde com dados em tempo real.',
          source: 'docs',
        },
        score: 0.9,
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IronService,
        { provide: MeteorologyService, useValue: mockMeteorologyService },
        { provide: OceanographyService, useValue: mockOceanographyService },
        { provide: TrafficService, useValue: mockTrafficService },
        { provide: ComercioService, useValue: mockComercioService },
        { provide: NoticiasRegionaisService, useValue: mockNoticiasService },
        { provide: NewsRepository, useValue: mockNewsRepo },
        { provide: WeatherNewsRepository, useValue: mockWeatherNewsRepo },
        { provide: GeminiChatRepository, useValue: mockGeminiChat },
        { provide: RagService, useValue: mockRagService },
        { provide: GeminiContextBuilder, useValue: { buildContext: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();

    service = module.get<IronService>(IronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processMessage', () => {
    it('should respond using Gemini chat', async () => {
      const result = await service.processMessage('como está o tempo?');
      expect(result.reply).toBe('Resposta do Irons via Gemini');
      expect(mockGeminiChat.chat).toHaveBeenCalled();
    });

    it('should collect context from all services', async () => {
      await service.processMessage('qual a situação geral?');
      expect(mockMeteorologyService.getCurrentWeather).toHaveBeenCalledWith('ilha-comprida');
      expect(mockOceanographyService.getSwellConditions).toHaveBeenCalled();
      expect(mockTrafficService.getTraffic).toHaveBeenCalled();
      expect(mockComercioService.getAllCommerce).toHaveBeenCalled();
      expect(mockNoticiasService.getData).toHaveBeenCalled();
    });

    it('should collect rankings context from WSL', async () => {
      await service.processMessage('quem está liderando o ranking?');
      expect(mockNewsRepo.getNewsData).toHaveBeenCalled();
    });

    it('should collect weather news alerts', async () => {
      await service.processMessage('tem algum alerta?');
      expect(mockWeatherNewsRepo.getWeatherNews).toHaveBeenCalled();
    });

    it('should forward history to the chat repository', async () => {
      const history = [
        { role: 'user' as const, content: 'como estão as ondas?' },
        { role: 'assistant' as const, content: 'Ondas de 1,2m.' },
      ];
      await service.processMessage('e amanhã?', history, 'session-123');
      expect(mockGeminiChat.chat).toHaveBeenCalledWith(
        'e amanhã?',
        expect.any(Object),
        history,
      );
    });

    it('should include RAG sources in the response and rag chunks in the prompt context', async () => {
      const result = await service.processMessage('como funciona o chat?');
      expect(mockRagService.retrieve).toHaveBeenCalledWith('como funciona o chat?');
      expect(result.sources).toEqual([
        {
          title: 'SYSTEM_SPEC.md',
          section: 'Chat',
          source: 'docs',
          snippet: expect.any(String),
        },
      ]);
      const context = mockGeminiChat.chat.mock.calls.at(-1)?.[1];
      expect(context.rag.chunks[0].title).toBe('SYSTEM_SPEC.md');
    });

    it('should proceed without sources when RAG retrieval fails', async () => {
      mockRagService.retrieve.mockRejectedValueOnce(new Error('index gone'));
      const result = await service.processMessage('tempo?');
      expect(result.reply).toBe('Resposta do Irons via Gemini');
      expect(result.sources).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      mockGeminiChat.chat.mockRejectedValueOnce(new Error('Gemini Error'));
      const result = await service.processMessage('tempo');
      expect(result.reply).toContain('⚠️');
    });
  });
});
