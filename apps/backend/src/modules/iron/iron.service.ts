import { Injectable, Logger } from '@nestjs/common';
import { MeteorologyService } from '../meteorology/meteorology.service';
import { OceanographyService } from '../oceanography/oceanography.service';
import { TrafficService } from '../traffic/traffic.service';
import { ComercioService } from '../comercio/comercio.service';
import { NoticiasRegionaisService } from '../noticias-regionais/noticias-regionais.service';
import { NewsRepository } from '../news/news.repository';
import { WeatherNewsRepository } from '../meteorology/weather-news.repository';
import { GeminiChatRepository, ChatTurn } from './gemini-chat.repository';
import { RagService } from './rag/rag.service';
import { RagHit } from './rag/rag.types';
import { spNowKey, hourKeyFromNaive } from '../../common/time/sp-time';

type ChatSource = {
  title: string;
  section?: string;
  source: 'docs' | 'data';
  snippet: string;
};

type ChatResponse = {
  reply: string;
  data?: Record<string, unknown>;
  /** Trechos do knowledge base que fundamentaram a resposta (RAG). */
  sources?: ChatSource[];
};

@Injectable()
export class IronService {
  private readonly logger = new Logger(IronService.name);

  import { GeminiContextBuilder } from '../../common/ai/GeminiContextBuilder';

constructor(
    private readonly meteorologyService: MeteorologyService,
    private readonly oceanographyService: OceanographyService,
    private readonly trafficService: TrafficService,
    private readonly comercioService: ComercioService,
    private readonly noticiasService: NoticiasRegionaisService,
    private readonly newsRepo: NewsRepository,
    private readonly weatherNewsRepo: WeatherNewsRepository,
    private readonly geminiChat: GeminiChatRepository,
    private readonly ragService: RagService,
    private readonly contextBuilder: GeminiContextBuilder,
  ) {}

  async processMessage(
    message: string,
    history: ChatTurn[] = [],
    sessionId?: string,
  ): Promise<ChatResponse> {
    try {
      if (sessionId) {
        this.logger.log(`chat[${sessionId}]: ${message.slice(0, 80)}`);
      }

      // Retrieval híbrido (docs + dados); falha nunca bloqueia o chat.
      const ragHits = await this.ragService.retrieve(message).catch(() => [] as RagHit[]);

      const context = await this.contextBuilder.buildContext(history);
      const reply = await this.geminiChat.chat(message, this.withRagContext(context, ragHits), history);

      const sources: ChatSource[] = ragHits.map(h => ({
        title: h.chunk.title,
        section: h.chunk.section,
        source: h.chunk.source,
        snippet: h.chunk.text.slice(0, 160),
      }));

      return {
        reply,
        data: { contextCollected: true, ragHits: ragHits.length },
        ...(sources.length > 0 ? { sources } : {}),
      };
    } catch (err) {
      this.logger.error(`Error processing message: ${err}`);
      return { reply: '⚠️ Erro ao processar sua mensagem. Tente novamente.' };
    }
  }

  private withRagContext(
    context: Awaited<ReturnType<IronService['collectContext']>>,
    hits: RagHit[],
  ) {
    if (hits.length === 0) return context;
    return {
      ...context,
      rag: {
        chunks: hits.map(h => ({
          title: h.chunk.title,
          section: h.chunk.section,
          text: h.chunk.text,
        })),
      },
    };
  }

  private async collectContext() {
    await this.collectContext();
      this.meteorologyService.getCurrentWeather('ilha-comprida'),
      this.oceanographyService.getSwellConditions(),
      this.trafficService.getTraffic(),
      this.comercioService.getAllCommerce(),
      this.noticiasService.getData(),
      this.newsRepo.getNewsData(),
      this.getHourlyForecast(),
      this.getWeatherNewsAlerts(),
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
      rankings: rankingsResult.status === 'fulfilled' ? {
        men: rankingsResult.value.rankings.men.slice(0, 5),
        women: rankingsResult.value.rankings.women.slice(0, 5),
        events: rankingsResult.value.events.slice(0, 3),
      } : undefined,
      hourly: hourlyResult.status === 'fulfilled' ? hourlyResult.value : undefined,
      weatherNews: weatherNewsResult.status === 'fulfilled' ? weatherNewsResult.value : undefined,
    };
  }

  private async getHourlyForecast() {
    try {
      const data = await this.meteorologyService.getCurrentWeather('ilha-comprida');
      // Timestamps naive de SP — comparar com a hora atual de SP, nao com o
      // relógio UTC do processo (Vercel).
      const nowKey = spNowKey();
      const next6h = (data.hourly || [])
        .filter(h => hourKeyFromNaive(h.time) >= nowKey)
        .slice(0, 6)
        .map(h => ({
          time: h.time,
          temperature: h.temperature,
          windSpeed: h.windSpeed,
          precipitationProbability: h.precipitationProbability,
        }));
      return { next6h };
    } catch {
      return undefined;
    }
  }

  private async getWeatherNewsAlerts() {
    try {
      const result = await this.weatherNewsRepo.getWeatherNews();
      return {
        alerts: result.news
          .filter(n => n.type === 'alerta')
          .slice(0, 3)
          .map(n => ({ title: n.title, source: n.source, type: n.type })),
      };
    } catch {
      return undefined;
    }
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
