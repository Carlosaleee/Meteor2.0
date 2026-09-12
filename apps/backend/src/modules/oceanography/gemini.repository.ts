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
    const periodQuality = data.wavePeriod > 12 ? 'excelente' : data.wavePeriod > 9 ? 'boa' : 'curta';
    const swellDesc = data.swellHeight > 1.0 ? 'consistente' : data.swellHeight > 0.5 ? 'moderado' : 'fraco';

    let bestSpot = 'Boqueirão Norte';
    let spotReason = 'ondas suaves e acesso fácil';
    if (data.waveDirection > 150) {
      bestSpot = 'Costão do Sul';
      spotReason = 'direção favorável para ondas do sul';
    }
    if (data.waveHeight > 1.5) {
      bestSpot = 'Boqueirão Sul';
      spotReason = 'ondas maiores com melhor quebra';
    }
    if (data.waveHeight < 0.5) {
      bestSpot = 'Parada do Surf';
      spotReason = 'área protegida para ondas pequenas';
    }

    const quality = data.waveHeight >= 1.5
      ? `Condições ${data.qualityLabel}! Ondas de ${data.waveHeight}m com período de ${data.wavePeriod}s indicam uma sessão excelente.`
      : data.waveHeight >= 1.0
      ? `Condições ${data.qualityLabel.toLowerCase()} com ondas de ${data.waveHeight}m. Período de ${data.wavePeriod}s sugere ondas ${periodQuality}.`
      : `Ondas pequenas de ${data.waveHeight}m, ideal para iniciantes ou longboard. Período de ${data.wavePeriod}s.`;

    return `🏄 **Condições das Ondas**
${quality} Swell de ${data.swellHeight}m (${swellDesc}) vindo de ${dir}. Período de ${data.wavePeriod}s indica que as ondas estão ${periodQuality} formatadas. Para iniciantes, a faixa de 0.5-1.0m é ideal para praticar remada e pegar ondas quebrando suavemente.

🌬️ **Análise do Vento**
Ventos vindos de ${data.waveDirection > 120 ? 'sudeste' : 'sul'} com velocidade moderada. Superfície da água ${data.wavePeriod > 8 ? 'relativamente lisa, boa para manobras' : 'com ondulação leve, ideal para iniciantes'}. Para kitesurf e windsurf, as condições são ${data.wavePeriod > 10 ? 'favoráveis' : 'moderadas'}.

⏰ **Melhores Horários**
Janela ideal: ${data.bestTime}. Evite o período da tarde (após 14h) quando o vento terrestre costuma aumentar. Manhã cedo (06h-09h) oferece as melhores condições com vento offshore e mar mais liso.

🏆 **Melhores Picos**
${bestSpot} é o pico recomendado para hoje — ${spotReason}. Com a direção atual de ${dir}, este pico apresenta melhor quebra e condições mais consistentes. Para iniciantes, prefira a Prancha do Leste ou Balneário Adriana.

⚠️ **Alertas**
Próxima maré alta: ${data.nextTide}. Coeficiente: ${data.tideCoefficient}. ${data.tideCoefficient > 0.7 ? 'Maré com coeficiente alto — cuidado com correntes de retorno.' : 'Maré com coeficiente moderado — condições seguras para banhistas.'} Verifique sempre os avisos da Defesa Civil antes de entrar na água.`;
  }
}
