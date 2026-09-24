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
  windSpeed: number;
  windDirection: number;
  windGust: number;
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

       
      const response = await (client as { models: { generateContent: (opts: unknown) => Promise<unknown> } }).models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: this.config.get('GEMINI_TEMPERATURE') ?? 0.7,
          maxOutputTokens: 2500,
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
    const windDirLabel = this.getWindDirectionLabel(data.windDirection);
    const isOffshore = data.windDirection > 225 && data.windDirection < 315;
    const surfaceCondition = data.windSpeed < 10 ? 'lisa' : data.windSpeed < 20 ? 'leve ondulação' : 'agitada';
    
    return `Você é um analista profissional de surf e oceanografia costeira. Gere um briefing COMPLETO e DETALHADO sobre as condições de surf em Ilha Comprida, SP para as próximas horas.

Estrutura OBRIGATÓRIA do briefing (use tópicos com emoji):

🏄 **Condições das Ondas**
- Altura atual: ${data.waveHeight}m — tendência (aumentando/diminuindo)
- Período: ${data.wavePeriod}s — significado para qualidade (curta <8s, boa 8-12s, excelente >12s)
- Direção: ${data.waveDirection}° — impacto em cada pico da região
- Swell: ${data.swellHeight}m com período ${data.swellPeriod}s

🌬️ **Análise do Vento**
- Velocidade: ${data.windSpeed} km/h
- Direção: ${data.windDirection}° (${windDirLabel})
- Rajadas: ${data.windGust} km/h
- Tipo: ${isOffshore ? 'Offshore (favorável para surf)' : 'Onshore (desfavorável)'}
- Superfície da água: ${surfaceCondition}

🪁 **Kitesurf & Windsurf**
- Condições de vento: ${data.windSpeed >= 12 && data.windSpeed <= 35 ? 'FAVORÁVEIS' : data.windSpeed < 12 ? 'Insuficientes' : 'Perigosas'}
- Velocidade ideal para kitesurf: 15-25 km/h
- Velocidade ideal para windsurf: 12-30 km/h
- Vento atual: ${data.windSpeed} km/h — ${data.windSpeed >= 15 && data.windSpeed <= 25 ? 'Excelente para kite' : data.windSpeed >= 12 && data.windSpeed <= 30 ? 'Bom para windsurf' : 'Condições não ideais'}

⏰ **Melhores Horários**
- Janela ideal para surf: ${data.bestTime}
- Horários a evitar: tarde após 14h (vento terrestre)
- Manhã cedo (06h-09h): vento offshore, mar liso

🏆 **Melhores Points**
- Recomendação principal baseada na direção atual
- Alternativas para diferentes níveis (iniciante/avançado)

⚠️ **Alertas**
- Próxima maré: ${data.nextTide}
- Coeficiente: ${data.tideCoefficient}
- ${data.tideCoefficient > 0.7 ? 'ATENÇÃO: Maré com coeficiente alto — correntes de retorno fortes' : 'Coeficiente moderado — condições seguras'}

Dados numéricos para referência:
- Onda: ${data.waveHeight}m | Período: ${data.wavePeriod}s | Direção: ${data.waveDirection}°
- Swell: ${data.swellHeight}m | Período: ${data.swellPeriod}s
- Vento: ${data.windSpeed}km/h | Direção: ${data.windDirection}° | Rajada: ${data.windGust}km/h
- Qualidade: ${data.qualityLabel}

Seja ESPECÍFICO com números. Use linguagem acessível mas técnica. Máximo 4 parágrafos por seção.`;
  }

  private getWindDirectionLabel(deg: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8] ?? 'N';
  }

  private getFallbackSummary(data: MarineSnapshot): string {
    const dir = data.waveDirection > 120 && data.waveDirection < 180 ? 'SE' : 'S';
    const periodQuality = data.wavePeriod > 12 ? 'excelente' : data.wavePeriod > 9 ? 'boa' : 'curta';
    const swellDesc = data.swellHeight > 1.0 ? 'consistente' : data.swellHeight > 0.5 ? 'moderado' : 'fraco';
    const windDirLabel = this.getWindDirectionLabel(data.windDirection);
    const isOffshore = data.windDirection > 225 && data.windDirection < 315;

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

    const windAnalysis = isOffshore
      ? `Ventos OFFSHORE (${data.windSpeed} km/h de ${windDirLabel}) — favoráveis para surf! Superfície da água ${data.windSpeed < 10 ? 'lisa e limpa' : 'com leve textura'}.`
      : `Ventos ONSHORE (${data.windSpeed} km/h de ${windDirLabel}) — superfície ${data.windSpeed > 15 ? 'agitada' : 'com leve ondulação'}.`;

    const kiteCondition = data.windSpeed >= 15 && data.windSpeed <= 25
      ? 'EXCELENTE para kitesurf'
      : data.windSpeed >= 12 && data.windSpeed <= 30
      ? 'Bom para windsurf'
      : data.windSpeed < 12
      ? 'Insuficiente para esportes de vento'
      : 'Perigoso — vento forte';

    return `🏄 **Condições das Ondas**
${quality} Swell de ${data.swellHeight}m (${swellDesc}) vindo de ${dir}. Período de ${data.wavePeriod}s indica que as ondas estão ${periodQuality} formatadas. Para iniciantes, a faixa de 0.5-1.0m é ideal para praticar remada e pegar ondas quebrando suavemente.

🌬️ **Análise do Vento**
${windAnalysis} Rajadas de até ${data.windGust} km/h. ${data.windGust > data.windSpeed * 1.3 ? 'ATENÇÃO: Rajadas fortes — instabilidade na água.' : 'Rajadas dentro do normal.'}

🪁 **Kitesurf & Windsurf**
Condições: ${kiteCondition}. Velocidade atual: ${data.windSpeed} km/h. ${data.windSpeed >= 15 && data.windSpeed <= 25 ? 'Perfeito para kite com manobras. Use kites de 9-12m.' : data.windSpeed >= 12 ? 'Bom para windsurf com pranchas de downgrade.' : 'Aguarde ventos mais fortes para esportes de vento.'}

⏰ **Melhores Horários**
Janela ideal: ${data.bestTime}. Evite o período da tarde (após 14h) quando o vento terrestre costuma aumentar. Manhã cedo (06h-09h) oferece as melhores condições com vento offshore e mar mais liso.

🏆 **Melhores Points**
${bestSpot} é o point recomendado para hoje — ${spotReason}. Com a direção atual de ${dir}, este point apresenta melhor quebra e condições mais consistentes. Para iniciantes, prefira a Prancha do Leste ou Balneário Adriana.

⚠️ **Alertas**
Próxima maré alta: ${data.nextTide}. Coeficiente: ${data.tideCoefficient}. ${data.tideCoefficient > 0.7 ? 'Maré com coeficiente alto — cuidado com correntes de retorno.' : 'Maré com coeficiente moderado — condições seguras para banhistas.'} Verifique sempre os avisos da Defesa Civil antes de entrar na água.`;
  }
}
