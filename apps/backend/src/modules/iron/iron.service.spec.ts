import { Test, TestingModule } from '@nestjs/testing';
import { IronService } from './iron.service';
import { MeteorologyService } from '../meteorology/meteorology.service';
import { OceanographyService } from '../oceanography/oceanography.service';
import { TrafficService } from '../traffic/traffic.service';
import { ComercioService } from '../comercio/comercio.service';
import { NoticiasRegionaisService } from '../noticias-regionais/noticias-regionais.service';

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
    getHourlyForecast: jest.fn().mockResolvedValue([
      { windSpeed: 12, windGust: 18, windDirection: 180 },
      { windSpeed: 14, windGust: 20, windDirection: 175 },
    ]),
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
    getAllCommerce: jest.fn().mockReturnValue([
      { id: '1', name: 'Restaurante Teste', sector: 'Alimentação', address: 'Rua A' },
      { id: '2', name: 'Hotel Teste', sector: 'Hospedagem', address: 'Rua B' },
    ]),
  };

  const mockNoticiasService = {
    getData: jest.fn().mockReturnValue({
      news: [
        { id: '1', title: 'Notícia Teste', category: 'noticia' },
      ],
    }),
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
      ],
    }).compile();

    service = module.get<IronService>(IronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processMessage', () => {
    it('should respond to weather queries', async () => {
      const result = await service.processMessage('como está o tempo?');
      expect(result.reply).toContain('Temperatura');
      expect(result.reply).toContain('25°C');
    });

    it('should respond to wave queries', async () => {
      const result = await service.processMessage('como estão as ondas?');
      expect(result.reply).toContain('Onda');
      expect(result.reply).toContain('1.2m');
    });

    it('should respond to wind queries', async () => {
      const result = await service.processMessage('qual a velocidade do vento?');
      expect(result.reply).toContain('Vento');
      expect(result.reply).toContain('12 km/h');
    });

    it('should respond to traffic queries', async () => {
      const result = await service.processMessage('como está o trânsito?');
      expect(result.reply).toContain('Trânsito');
    });

    it('should respond to commerce queries', async () => {
      const result = await service.processMessage('tem restaurante por aqui?');
      expect(result.reply).toContain('Comércio');
    });

    it('should respond to news queries', async () => {
      const result = await service.processMessage('quais as notícias?');
      expect(result.reply).toContain('Notícias');
    });

    it('should respond to greeting', async () => {
      const result = await service.processMessage('oi');
      expect(result.reply).toContain('Irons');
    });

    it('should handle errors gracefully', async () => {
      mockMeteorologyService.getCurrentWeather.mockRejectedValueOnce(new Error('API Error'));
      const result = await service.processMessage('tempo');
      expect(result.reply).toContain('⚠️');
    });
  });
});
