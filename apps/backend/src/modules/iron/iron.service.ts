import { Injectable, Logger } from '@nestjs/common';
import { MeteorologyService } from '../meteorology/meteorology.service';
import { OceanographyService } from '../oceanography/oceanography.service';
import { TrafficService } from '../traffic/traffic.service';
import { ComercioService } from '../comercio/comercio.service';
import { NoticiasRegionaisService } from '../noticias-regionais/noticias-regionais.service';
import { GeminiChatRepository } from './gemini-chat.repository';

type ChatResponse = {
  reply: string;
  data?: Record<string, unknown>;
};

@Injectable()
export class IronService {
  private readonly logger = new Logger(IronService.name);

  constructor(
    private readonly meteorologyService: MeteorologyService,
    private readonly oceanographyService: OceanographyService,
    private readonly trafficService: TrafficService,
    private readonly comercioService: ComercioService,
    private readonly noticiasService: NoticiasRegionaisService,
    private readonly geminiChat: GeminiChatRepository,
  ) {}

  async processMessage(message: string): Promise<ChatResponse> {
    const q = message.toLowerCase().trim();

    try {
      const context = await this.collectContext();
      const reply = await this.geminiChat.chat(message, context);
      return { reply, data: { contextCollected: true } };
    } catch (err) {
      this.logger.error(`Error processing message: ${err}`);
      return { reply: '⚠️ Erro ao processar sua mensagem. Tente novamente.' };
    }
  }

  private async collectContext() {
    const [weatherResult, oceanResult, trafficResult, commerceResult, newsResult] = await Promise.allSettled([
      this.meteorologyService.getCurrentWeather('ilha-comprida'),
      this.oceanographyService.getSwellConditions(),
      this.trafficService.getTraffic(),
      this.comercioService.getAllCommerce(),
      this.noticiasService.getData(),
    ]);

    return {
      weather: weatherResult.status === 'fulfilled' ? {
        temperature: weatherResult.value.current.temperature,
        humidity: weatherResult.value.current.humidity,
        windSpeed: weatherResult.value.current.windSpeed,
        description: this.getWeatherDescription(weatherResult.value.current.weatherCode),
      } : undefined,
      ocean: oceanResult.status === 'fulfilled' ? {
        waveHeight: oceanResult.value.current.waveHeight,
        qualityLabel: oceanResult.value.qualityLabel,
        bestTime: oceanResult.value.bestTime,
        nextTide: oceanResult.value.nextTide,
      } : undefined,
      traffic: trafficResult.status === 'fulfilled' ? {
        routes: trafficResult.value.routes.map(r => ({
          name: r.name,
          condition: r.condition,
        })),
      } : undefined,
      commerce: commerceResult.status === 'fulfilled' ? {
        total: commerceResult.value.length,
        sectors: [...new Set(commerceResult.value.map(c => c.sector))],
      } : undefined,
      news: newsResult.status === 'fulfilled' ? {
        headlines: newsResult.value.news.slice(0, 3).map(n => n.title),
      } : undefined,
    };
  }

  private getWeatherDescription(code: number): string {
    const descriptions: Record<number, string> = {
      0: 'Céu limpo', 1: 'Principalmente limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
      45: 'Nevoeiro', 48: 'Nevoeiro com geada',
      51: 'Chuva leve', 53: 'Chuva moderada', 55: 'Chuva forte',
      61: 'Chuva leve', 63: 'Chuva moderada', 65: 'Chuva forte',
      80: 'Pancadas leves', 81: 'Pancadas moderadas', 82: 'Pancadas fortes',
      95: 'Tempestade', 96: 'Tempestade com granizo', 99: 'Tempestade com granizo',
    };
    return descriptions[code] ?? 'Condição desconhecida';
  }
}
