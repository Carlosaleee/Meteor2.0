import { Test, TestingModule } from '@nestjs/testing';
import { MeteorologyService } from './meteorology.service';
import { OpenMeteoRepository } from './open-meteo.repository';

describe('MeteorologyService', () => {
  let service: MeteorologyService;

  const mockOpenMeteoRepository = {
    getAtmosphereData: jest.fn().mockResolvedValue({
      current: {
        temperature_2m: 25,
        apparent_temperature: 27,
        relative_humidity_2m: 70,
        wind_speed_10m: 12,
        wind_gusts_10m: 21,
        wind_direction_10m: 180,
        surface_pressure: 1013,
        precipitation: 0,
        weather_code: 1,
      },
      hourly: {
        time: ['2024-01-01T00:00', '2024-01-01T01:00'],
        temperature_2m: [24, 25],
        relative_humidity_2m: [72, 70],
        precipitation_probability: [10, 15],
        precipitation: [0, 0],
        weather_code: [1, 2],
        wind_speed_10m: [11, 12],
        wind_gusts_10m: [18, 21],
        cloud_cover: [50, 60],
        visibility: [10000, 9000],
      },
      daily: {
        time: ['2024-01-01'],
        temperature_2m_max: [28],
        temperature_2m_min: [20],
        precipitation_sum: [0],
        precipitation_probability_max: [20],
        wind_speed_10m_max: [15],
        weather_code: [1],
        sunrise: ['2024-01-01T06:00'],
        sunset: ['2024-01-01T18:00'],
        uv_index_max: [8],
      },
      meta: {
        source: 'live',
        fetchedAt: '2026-10-30T12:00:00.000Z',
        dataKind: 'forecast',
        provider: 'Open-Meteo',
        model: 'best_match',
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeteorologyService,
        { provide: OpenMeteoRepository, useValue: mockOpenMeteoRepository },
      ],
    }).compile();

    service = module.get<MeteorologyService>(MeteorologyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentWeather', () => {
    it('should return weather for default location', async () => {
      const result = await service.getCurrentWeather();
      expect(result.current.temperature).toBe(25);
      expect(result.current.humidity).toBe(70);
    });

    it('should return weather for specific location', async () => {
      const result = await service.getCurrentWeather('iguape');
      expect(result.locationId).toBe('iguape');
    });

    it('should include hourly data', async () => {
      const result = await service.getCurrentWeather();
      expect(Array.isArray(result.hourly)).toBe(true);
      expect(result.hourly.length).toBeGreaterThanOrEqual(1);
      expect(result.hourly[0]).toHaveProperty('time');
      expect(result.hourly[0]).toHaveProperty('temperature');
    });

    it('should include daily data', async () => {
      const result = await service.getCurrentWeather();
      expect(result.daily).toHaveLength(1);
    });

    it('should expose explicit temporal contract (timezone, fetchedAt, meta)', async () => {
      const result = await service.getCurrentWeather();
      expect(result.timezone).toBe('America/Sao_Paulo');
      expect(result.fetchedAt).toBe('2026-10-30T12:00:00.000Z');
      expect(typeof result.ageHours).toBe('number');
      expect(result.ageHours).toBeGreaterThanOrEqual(0);
      expect(result.meta).toEqual({
        dataKind: 'forecast',
        provider: 'Open-Meteo',
        model: 'best_match',
      });
      // timestamp continua sendo o instante da resposta (contrato legado mantido)
      expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should expose wind gusts in current and hourly', async () => {
      const result = await service.getCurrentWeather();
      expect(result.current.windGust).toBe(21);
      expect(result.hourly[0].windGust).toBe(18);
    });

    it('should default fetchedAt/meta when repository has no provenance (legacy cache)', async () => {
      mockOpenMeteoRepository.getAtmosphereData.mockResolvedValueOnce({
        current: { temperature_2m: 20, apparent_temperature: 20, relative_humidity_2m: 80, wind_speed_10m: 10, wind_direction_10m: 90, surface_pressure: 1015, precipitation: 0, weather_code: 1 },
        hourly: { time: [], temperature_2m: [], relative_humidity_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], cloud_cover: [], visibility: [] },
        daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [], weather_code: [], sunrise: [], sunset: [], uv_index_max: [] },
      });
      const result = await service.getCurrentWeather();
      expect(result.fetchedAt).toBeNull();
      expect(result.meta.dataKind).toBe('forecast');
      expect(result.source).toBe('live');
      expect(result.current.windGust).toBeNull();
    });
  });

  describe('cenarios meteorologicos (MET-07)', () => {
    it('stale: propaga source=stale com idade real (>24h) e fetchedAt antigo', async () => {
      mockOpenMeteoRepository.getAtmosphereData.mockResolvedValueOnce({
        current: { temperature_2m: 20, apparent_temperature: 20, relative_humidity_2m: 80, wind_speed_10m: 10, wind_direction_10m: 90, surface_pressure: 1015, precipitation: 0, weather_code: 1 },
        hourly: { time: [], temperature_2m: [], relative_humidity_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], cloud_cover: [], visibility: [] },
        daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [], weather_code: [], sunrise: [], sunset: [], uv_index_max: [] },
        meta: { source: 'stale', fetchedAt: '2026-10-27T10:00:00.000Z', dataKind: 'forecast', provider: 'Open-Meteo' },
      });
      const result = await service.getCurrentWeather();
      expect(result.source).toBe('stale');
      expect(result.ageHours).toBeGreaterThan(24);
      expect(result.fetchedAt).toBe('2026-10-27T10:00:00.000Z');
    });

    it('sample: meta.dataKind=sample e ageHours=null (conteudo sintetico nao tem coleta)', async () => {
      mockOpenMeteoRepository.getAtmosphereData.mockResolvedValueOnce({
        current: { temperature_2m: 22.1, apparent_temperature: 22, relative_humidity_2m: 78, wind_speed_10m: 14, wind_gusts_10m: 19.6, wind_direction_10m: 135, surface_pressure: 1016, precipitation: 0, weather_code: 1 },
        hourly: { time: [], temperature_2m: [], relative_humidity_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], cloud_cover: [], visibility: [] },
        daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [], weather_code: [], sunrise: [], sunset: [], uv_index_max: [] },
        meta: { source: 'sample', dataKind: 'sample', provider: 'synthetic' },
      });
      const result = await service.getCurrentWeather();
      expect(result.source).toBe('sample');
      expect(result.meta.dataKind).toBe('sample');
      expect(result.meta.provider).toBe('synthetic');
      expect(result.fetchedAt).toBeNull();
      expect(result.ageHours).toBeNull();
    });

    it('codigo de tempo extremo (99 tempestade com granizo forte) passa sem truncar', async () => {
      mockOpenMeteoRepository.getAtmosphereData.mockResolvedValueOnce({
        current: { temperature_2m: 31, apparent_temperature: 36, relative_humidity_2m: 92, wind_speed_10m: 55, wind_gusts_10m: 95, wind_direction_10m: 270, surface_pressure: 1002, precipitation: 12.5, weather_code: 99 },
        hourly: { time: ['2026-10-30T12:00'], temperature_2m: [31], relative_humidity_2m: [92], precipitation_probability: [95], precipitation: [12.5], weather_code: [99], wind_speed_10m: [55], cloud_cover: [100], visibility: [800] },
        daily: { time: ['2026-10-30'], temperature_2m_max: [33], temperature_2m_min: [24], precipitation_sum: [45], precipitation_probability_max: [95], wind_speed_10m_max: [70], weather_code: [99], sunrise: ['2026-10-30T05:45'], sunset: ['2026-10-30T18:32'], uv_index_max: [11] },
        meta: { source: 'live', fetchedAt: '2026-10-30T14:00:00.000Z', dataKind: 'forecast', provider: 'Open-Meteo', model: 'best_match' },
      });
      const result = await service.getCurrentWeather();
      expect(result.current.weatherCode).toBe(99);
      expect(result.current.windGust).toBe(95);
      expect(result.hourly[0].weatherCode).toBe(99);
      expect(result.daily[0].precipitationSum).toBe(45);
      expect(result.daily[0].uvIndexMax).toBe(11);
    });

    it('hourly curto (menos de 24h no fim do array) nao estoura: fatia limitada pelo tamanho', async () => {
      // 3 horas de dados — inicio do array ja esta na "hora atual" simulada
      mockOpenMeteoRepository.getAtmosphereData.mockResolvedValueOnce({
        current: { temperature_2m: 18, apparent_temperature: 17, relative_humidity_2m: 85, wind_speed_10m: 9, wind_direction_10m: 20, surface_pressure: 1019, precipitation: 0, weather_code: 3 },
        hourly: {
          time: ['2026-10-30T10:00', '2026-10-30T11:00', '2026-10-30T12:00'],
          temperature_2m: [18, 19, 20], relative_humidity_2m: [85, 84, 83],
          precipitation_probability: [5, 10, 15], precipitation: [0, 0, 0],
          weather_code: [3, 3, 2], wind_speed_10m: [9, 10, 11],
          cloud_cover: [80, 75, 60], visibility: [6000, 7000, 8000],
        },
        daily: { time: ['2026-10-30'], temperature_2m_max: [21], temperature_2m_min: [15], precipitation_sum: [0], precipitation_probability_max: [15], wind_speed_10m_max: [12], weather_code: [3], sunrise: ['2026-10-30T05:45'], sunset: ['2026-10-30T18:32'], uv_index_max: [6] },
        meta: { source: 'live', fetchedAt: '2026-10-30T12:00:00.000Z', dataKind: 'forecast' },
      });
      const result = await service.getCurrentWeather();
      expect(result.hourly.length).toBeLessThanOrEqual(3);
      expect(result.hourly.length).toBeGreaterThan(0);
      expect(result.hourly[0]).toHaveProperty('temperature');
    });

    it('hourly sem a hora atual no array -> comeca do indice 0 (fallback)', async () => {
      mockOpenMeteoRepository.getAtmosphereData.mockResolvedValueOnce({
        current: { temperature_2m: 20, apparent_temperature: 20, relative_humidity_2m: 70, wind_speed_10m: 10, wind_direction_10m: 90, surface_pressure: 1015, precipitation: 0, weather_code: 1 },
        hourly: {
          time: ['2099-01-01T00:00', '2099-01-01T01:00'],
          temperature_2m: [20, 21], relative_humidity_2m: [70, 70],
          precipitation_probability: [0, 0], precipitation: [0, 0],
          weather_code: [1, 1], wind_speed_10m: [10, 10],
          cloud_cover: [10, 10], visibility: [10000, 10000],
        },
        daily: { time: ['2099-01-01'], temperature_2m_max: [25], temperature_2m_min: [18], precipitation_sum: [0], precipitation_probability_max: [0], wind_speed_10m_max: [12], weather_code: [1], sunrise: ['2099-01-01T06:00'], sunset: ['2099-01-01T18:00'], uv_index_max: [7] },
        meta: { source: 'live', fetchedAt: '2026-10-30T12:00:00.000Z' },
      });
      const result = await service.getCurrentWeather();
      expect(result.hourly).toHaveLength(2);
      expect(result.hourly[0].time).toBe('2099-01-01T00:00');
    });

    it('locationId desconhecido cai para a localidade padrao (ilha-comprida)', async () => {
      mockOpenMeteoRepository.getAtmosphereData.mockResolvedValueOnce({
        current: { temperature_2m: 25, apparent_temperature: 27, relative_humidity_2m: 70, wind_speed_10m: 12, wind_direction_10m: 180, surface_pressure: 1013, precipitation: 0, weather_code: 1 },
        hourly: { time: [], temperature_2m: [], relative_humidity_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], cloud_cover: [], visibility: [] },
        daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [], weather_code: [], sunrise: [], sunset: [], uv_index_max: [] },
      });
      const result = await service.getCurrentWeather('cidade-inexistente');
      expect(result.location).toBe('Ilha Comprida');
      // chamada com as coordenadas padrao
      expect(mockOpenMeteoRepository.getAtmosphereData).toHaveBeenLastCalledWith(-24.73, -47.55, 'cidade-inexistente');
    });
  });
});
