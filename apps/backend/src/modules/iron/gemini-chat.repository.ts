import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../common/config/env.schema';

type ChatContext = {
  weather?: { temperature: number; humidity: number; windSpeed: number; description: string };
  ocean?: { waveHeight: number; qualityLabel: string; bestTime: string; nextTide: string };
  traffic?: { routes: Array<{ name: string; condition: string }> };
  commerce?: { total: number; sectors: string[] };
  news?: { headlines: string[] };
};

@Injectable()
export class GeminiChatRepository {
  private readonly logger = new Logger(GeminiChatRepository.name);
  private genAi: unknown = null;

  constructor(private readonly config: ConfigService<Env>) {}

  private getClient(): unknown {
    if (this.genAi) return this.genAi;

    const apiKey = this.config.get('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured for chat');
      return null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GoogleGenAI } = require('@google/genai');
      this.genAi = new GoogleGenAI({ apiKey });
      return this.genAi;
    } catch (err) {
      this.logger.warn(`Failed to initialize Gemini for chat: ${err}`);
      return null;
    }
  }

  async chat(userMessage: string, context: ChatContext): Promise<string> {
    const client = this.getClient();
    if (!client) return this.getFallbackResponse(userMessage);

    try {
      const model = this.config.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
      const prompt = this.buildPrompt(userMessage, context);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const response = await (client as { models: { generateContent: (opts: unknown) => Promise<unknown> } }).models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: this.config.get('GEMINI_TEMPERATURE') ?? 0.7,
          maxOutputTokens: 1000,
        },
      });

      const text = (response as { text?: string })?.text;
      if (text && text.length > 10) return text;
      return this.getFallbackResponse(userMessage);
    } catch (err) {
      this.logger.warn(`Gemini chat failed: ${err}`);
      return this.getFallbackResponse(userMessage);
    }
  }

  private buildPrompt(userMessage: string, context: ChatContext): string {
    const contextParts: string[] = [];

    if (context.weather) {
      const w = context.weather;
      contextParts.push(`CLIMA ATUAL: ${w.temperature}°C (sensação térmica), ${w.humidity}% umidade, vento ${w.windSpeed}km/h, condição: ${w.description}`);
    }
    if (context.ocean) {
      const o = context.ocean;
      contextParts.push(`MAR: ondas ${o.waveHeight}m, qualidade: ${o.qualityLabel}, melhor horário: ${o.bestTime}, próxima maré: ${o.nextTide}`);
    }
    if (context.traffic) {
      const routes = context.traffic.routes.map(r => `${r.name}: ${r.condition}`).join(', ');
      contextParts.push(`TRÂNSITO: ${routes}`);
    }
    if (context.commerce) {
      contextParts.push(`COMÉRCIO: ${context.commerce.total} estabelecimentos nos setores: ${context.commerce.sectors.join(', ')}`);
    }
    if (context.news) {
      contextParts.push(`NOTÍCIAS: ${context.news.headlines.slice(0, 3).join('; ')}`);
    }

    return `Você é o Irons, assistente tático do Meteor 2.0, especializado em surf, clima e vida na região de Ilha Comprida e Vale do Ribeira (litoral sul de São Paulo).

Dados em tempo real disponíveis:
${contextParts.join('\n') || 'Nenhum dado disponível no momento.'}

REGRAS:
- Responda em português brasileiro
- Seja conciso (máximo 3-4 parágrafos)
- Use emojis para organizar a resposta
- Se a pergunta for sobre surf/clima, use os dados acima
- Se não souber, diga honestamente e sugira usar as telas do Meteor 2.0
- Nunca invente dados numéricos

PERGUNTA DO USUÁRIO: ${userMessage}`;
  }

  private getFallbackResponse(userMessage: string): string {
    const q = userMessage.toLowerCase();

    if (q.includes('oi') || q.includes('olá') || q.includes('ola') || q.includes('hello')) {
      return 'Olá! Sou o **Irons**, seu assistente tático de surf e clima. Pergunte sobre previsão do tempo, ondas, vento, trânsito ou comércio na região de Ilha Comprida e Vale do Ribeira.';
    }
    if (q.includes('quem') || q.includes('sobre') || q.includes('faz')) {
      return 'Sou o **Irons**, assistente tático do Meteor 2.0. Fui criado em homenagem ao surfista Andy Irons (1978-2010). Meu objetivo é te ajudar com informações sobre clima, surf, trânsito e comércio de Ilha Comprida e Vale do Ribeira.';
    }

    return '📊 **Consulte os dados em tempo real:** Use as telas do Meteor 2.0 para previsões precisas. Para dúvidas específicas, pergunte sobre:\n\n• 🌤️ Tempo e clima\n• 🏄 Ondas e swell\n• 💨 Vento e rajadas\n• 🚗 Trânsito e rodovias\n• 🏪 Comércio local\n• 📰 Notícias regionais';
  }
}
