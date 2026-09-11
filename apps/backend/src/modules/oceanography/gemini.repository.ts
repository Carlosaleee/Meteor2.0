import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../common/config/env.schema';

type MarineSnapshot = {
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  qualityLabel: string;
  bestTime: string;
  nextTide: string;
  tideCoefficient: number;
};

@Injectable()
export class GeminiRepository {
  private readonly logger = new Logger(GeminiRepository.name);
  private genAi: unknown = null;

  constructor(private readonly config: ConfigService<Env>) {}

  private getClient(): unknown {
    if (this.genAi) return this.genAi;

    const apiKey = this.config.get('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured');
      return null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GoogleGenAI } = require('@google/genai');
      this.genAi = new GoogleGenAI({ apiKey });
      return this.genAi;
    } catch (err) {
      this.logger.warn(`Failed to initialize Gemini: ${err}`);
      return null;
    }
  }

  async generateSummary(data: MarineSnapshot): Promise<string> {
    const client = this.getClient();
    if (!client) return this.getFallbackSummary(data);

    try {
      const model = this.config.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
      const prompt = this.buildPrompt(data);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const response = await (client as { models: { generateContent: (opts: unknown) => Promise<unknown> } }).models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: this.config.get('GEMINI_TEMPERATURE') ?? 0.7,
          maxOutputTokens: 600,
        },
      });

      const text = (response as { text?: string })?.text;
      if (text && text.length > 10) return text;
      return this.getFallbackSummary(data);
    } catch (err) {
      this.logger.warn(`Gemini API failed: ${err}`);
      return this.getFallbackSummary(data);
    }
  }

  private buildPrompt(data: MarineSnapshot): string {
    return `Você é um analista profissional de surf e oceanografia costeira. Gere um briefing completo e detalhado sobre as condições de surf em Ilha Comprida, SP para as próximas horas.

Estrutura OBRIGATÓRIA do briefing (use tópicos com emoji):

🏄 **Condições das Ondas**
- Altura atual e tendência (aumentando/diminuindo)
- Período e o que isso significa para a qualidade
- Direção e como ela afeta cada pico da região

🌬️ **Análise do Vento**
- Velocidade e direção atual
- Previsão para as próximas horas
- Impacto na superfície da água (lisa/agitada)

⏰ **Melhores Horários**
- Janela ideal para surf (horário específico)
- Horários a evitar

🏆 **Melhores Picos**
- Qual pico está melhor com as condições atuais
- Por que esse pico está favorável

⚠️ **Alertas**
- Avisos de mar agitado, correntes, etc.

Dados atuais:
- Altura da onda: ${data.waveHeight}m
- Período: ${data.wavePeriod}s
- Direção: ${data.waveDirection}°
- Swell: ${data.swellHeight}m com período ${data.swellPeriod}s
- Qualidade: ${data.qualityLabel}
- Melhor horário: ${data.bestTime}
- Próxima maré: ${data.nextTide}

Seja específico com números. Use linguagem acessível mas técnica.`;
  }

  private getFallbackSummary(data: MarineSnapshot): string {
    const dir = data.waveDirection > 120 && data.waveDirection < 180 ? 'SE' : 'S';
    const quality = data.waveHeight >= 1.0
      ? `Condições ${data.qualityLabel.toLowerCase()} com ondas de ${data.waveHeight}m.`
      : `Ondas pequenas de ${data.waveHeight}m, ideal para iniciantes.`;

    let bestSpot = 'Boqueirão Norte';
    if (data.waveDirection > 150) bestSpot = 'Costão do Sul';
    if (data.waveHeight > 1.5) bestSpot = 'Boqueirão Sul';

    return `🏄 **Condições das Ondas**
${quality} Período de ${data.wavePeriod}s indica ondas ${data.wavePeriod > 10 ? 'bem formatadas' : 'menores'}. Swell de ${data.swellHeight}m vindo de ${dir}.

🌬️ **Vento**
Ventos favoráveis para a manhã. Superfície ${data.wavePeriod > 8 ? 'relativamente lisa' : 'com ondulação'}.

⏰ **Melhores Horários**
Janela ideal: ${data.bestTime}. Evite o período da tarde com vento terrestre.

🏆 **Melhores Picos**
${bestSpot} está favorável com a direção atual de ${dir}.

⚠️ **Alertas**
Próxima maré alta: ${data.nextTide}. Coeficiente: ${data.tideCoefficient}.`;
  }
}
