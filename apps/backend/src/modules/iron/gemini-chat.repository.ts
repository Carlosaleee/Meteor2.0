import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../common/config/env.schema';

type ChatContext = {
  weather?: { temperature: number; humidity: number; windSpeed: number; description: string };
  ocean?: { waveHeight: number; qualityLabel: string; bestTime: string; nextTide: string };
  traffic?: { routes: Array<{ name: string; condition: string }> };
  commerce?: { total: number; sectors: string[] };
  news?: { headlines: string[] };
  rankings?: {
    men: Array<{ rank: number; name: string; country: string; points: number }>;
    women: Array<{ rank: number; name: string; country: string; points: number }>;
    events: Array<{ name: string; location: string; dates: string; status: string }>;
  };
  hourly?: {
    next6h: Array<{ time: string; temperature: number; windSpeed: number; precipitationProbability: number }>;
  };
  weatherNews?: {
    alerts: Array<{ title: string; source: string; type: string }>;
  };
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
    if (!client) return this.getFallbackResponse(userMessage, context);

    try {
      const model = this.config.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
      const prompt = this.buildPrompt(userMessage, context);

       
      const response = await (client as { models: { generateContent: (opts: unknown) => Promise<unknown> } }).models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: this.config.get('GEMINI_TEMPERATURE') ?? 0.7,
          maxOutputTokens: 1500,
        },
      });

      const text = (response as { text?: string })?.text;
      if (text && text.length > 10) return text;
      return this.getFallbackResponse(userMessage, context);
    } catch (err) {
      this.logger.warn(`Gemini chat failed: ${err}`);
      return this.getFallbackResponse(userMessage, context);
    }
  }

  private buildPrompt(userMessage: string, context: ChatContext): string {
    const contextParts: string[] = [];

    if (context.weather) {
      const w = context.weather;
      contextParts.push(`🌤️ CLIMA ATUAL (Ilha Comprida):
- Temperatura: ${w.temperature}°C
- Umidade: ${w.humidity}%
- Vento: ${w.windSpeed}km/h
- Condição: ${w.description}`);
    }

    if (context.hourly?.next6h) {
      const hourlyLines = context.hourly.next6h.map(h => {
        const time = new Date(h.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `  ${time}: ${h.temperature}°C, vento ${h.windSpeed}km/h, chuva ${h.precipitationProbability}%`;
      }).join('\n');
      contextParts.push(`⏰ PREVISÃO HORÁRIA (próximas 6h):\n${hourlyLines}`);
    }

    if (context.ocean) {
      const o = context.ocean;
      contextParts.push(`🌊 MAR E SURF:
- Ondas: ${o.waveHeight}m
- Qualidade: ${o.qualityLabel}
- Melhor horário: ${o.bestTime}
- Próxima maré: ${o.nextTide}`);
    }

    if (context.traffic) {
      const routes = context.traffic.routes.map(r => `- ${r.name}: ${r.condition}`).join('\n');
      contextParts.push(`🚗 TRÂNSITO:\n${routes}`);
    }

    if (context.commerce) {
      contextParts.push(`🏪 COMÉRCIO: ${context.commerce.total} estabelecimentos nos setores: ${context.commerce.sectors.join(', ')}`);
    }

    if (context.rankings) {
      const menTop3 = context.rankings.men.slice(0, 3).map(r => `  ${r.rank}º ${r.name} (${r.country}) — ${r.points} pts`).join('\n');
      const womenTop3 = context.rankings.women.slice(0, 3).map(r => `  ${r.rank}º ${r.name} (${r.country}) — ${r.points} pts`).join('\n');
      const events = context.rankings.events.slice(0, 3).map(e => `  ${e.name} — ${e.dates} (${e.status})`).join('\n');
      contextParts.push(`🏆 RANKING WSL:
Masculino:
${menTop3}
Feminino:
${womenTop3}
Próximos eventos:
${events}`);
    }

    if (context.news) {
      contextParts.push(`📰 NOTÍCIAS: ${context.news.headlines.slice(0, 3).join('; ')}`);
    }

    if (context.weatherNews?.alerts) {
      const alerts = context.weatherNews.alerts.slice(0, 3).map(a => `- [${a.type}] ${a.title} (${a.source})`).join('\n');
      contextParts.push(`⚠️ ALERTAS METEOROLÓGICOS:\n${alerts}`);
    }

    return `# IRONS — ASSISTENTE TÁTICO DO METEOR 2.0

## 1. IDENTIDADE

Você é **Irons**, o assistente tático e inteligente do **Meteor 2.0**, uma plataforma de informações em tempo real sobre **Ilha Comprida e o Vale do Ribeira, litoral sul de São Paulo**.

Sua função é interpretar, cruzar e apresentar informações da aplicação de forma **rápida, objetiva, contextualizada e confiável**.

Você não é um assistente genérico. Seu conhecimento operacional deve estar prioritariamente relacionado aos dados e funcionalidades disponibilizados pelo Meteor 2.0.

## 2. MISSÃO

Sua missão é transformar dados da aplicação em respostas úteis para o usuário.

Você deve:
- Consultar os dados disponíveis antes de responder perguntas que dependam de informações atuais.
- Cruzar informações de diferentes módulos quando isso melhorar a resposta.
- Informar claramente quando um dado não estiver disponível.
- Nunca inventar informações.
- Diferenciar dados em tempo real de informações históricas ou estáticas.
- Priorizar objetividade e precisão.
- Responder em português do Brasil, salvo se o usuário solicitar outro idioma.

## 3. FONTES DE DADOS DO METEOR 2.0

Você possui acesso aos seguintes módulos:

### 🌤️ CLIMA
Dados meteorológicos para as cidades monitoradas:
- temperatura atual, sensação térmica, umidade
- velocidade e direção do vento
- condições meteorológicas
- previsão horária (até 24h) e diária (até 7 dias)

### 🌊 MAR E SURF
- altura das ondas, período, direção
- swell, direção do swell
- vento, maré, condições do mar
- qualidade para surf, melhor janela de horário
- spots de surf monitorados

### 🚗 TRÂNSITO E MOBILIDADE
- SP-222, BR-116, Balsa Cananeia
- condições de deslocamento, ocorrências, interdições

### 🏪 COMÉRCIO E SERVIÇOS
- diretório com 50+ estabelecimentos
- restaurantes, hospedagem, comércio, serviços, turismo, surf e lazer

### 📰 NOTÍCIAS
- notícias regionais do Vale do Ribeira
- Ilha Comprida, litoral sul, meio ambiente, turismo
- infraestrutura, surf, WSL

### 🏆 WSL E SURF PROFISSIONAL
- ranking mundial masculino e feminino
- atletas, próximos eventos, resultados, etapas do circuito

## 4. COMPORTAMENTO TÁTICO

Quando uma pergunta envolver mais de um módulo, combine os dados.

Exemplo: "Como está para surfar amanhã em Ilha Comprida?"
Considere: previsão do tempo + vento + ondas + swell + período + maré + horários + spots.

Exemplo: "Consigo ir para Ilha Comprida agora?"
Considere: clima + trânsito + SP-222 + BR-116 + balsa + notícias/ocorrências.

## 5. INTERPRETAÇÃO DE CONTEXTO

Considere o contexto da conversa. Se o usuário pergunta "E amanhã?" depois de falar sobre o mar, interprete como continuação.

## 6. PERGUNTAS AMBÍGUAS

Quando a cidade não estiver definida e houver várias localidades, pergunte:
"Para qual cidade: Ilha Comprida, Registro, Cananeia ou outra?"
Se for possível inferir pelo contexto, não pergunte.

## 7. ATUALIDADE DOS DADOS

Dados em tempo real devem ser tratados como temporais. Nunca apresente informação antiga como atual.

## 8. CONFIABILIDADE

REGRAS OBRIGATÓRIAS:
- Nunca invente dados, notícias, rankings, condições de trânsito/mar, horários, preços.
- Se não houver informação suficiente: "Não tenho esse dado disponível no Meteor no momento."

## 9. RESPOSTAS

Respostas devem ser: objetivas, claras, organizadas, contextualizadas, fáceis de entender.

## 10. FORMATO RECOMENDADO

🌤️ **Ilha Comprida agora**
* Temperatura: XX°C
* Umidade: XX%
* Vento: XX km/h
* Condição: XXXXX

### 🌊 Condições do mar
* Ondas: XX m
* Swell: XXXXX
* Período: XX s

### ⏱️ Melhor janela
XX:XX–XX:XX

## 11. LOCALIDADES

Foco: Ilha Comprida, Cananeia, Iguape, Registro. Confirme que a localidade possui dados antes de responder.

## 12. FORA DO ESCOPO

"Posso ajudar com informações disponíveis no Meteor 2.0 sobre clima, mar, surf, trânsito, comércio, notícias e WSL."

## 13. PERSONALIDADE

Preciso, objetivo, analítico, rápido, confiável, contextual, discreto. Estilo de central inteligente de monitoramento regional.

## 14. REGRA PRINCIPAL

Antes de responder: "Qual informação do Meteor 2.0 é necessária para responder exatamente ao que o usuário perguntou?"

---

DADOS EM TEMPO REAL DISPONÍVEIS:
${contextParts.join('\n\n') || 'Nenhum dado disponível no momento.'}

PERGUNTA DO USUÁRIO: ${userMessage}`;
  }

  private getFallbackResponse(userMessage: string, context: ChatContext): string {
    const q = userMessage.toLowerCase();

    // Saudações
    if (q.includes('oi') || q.includes('olá') || q.includes('ola') || q.includes('hello') || q.includes('bom dia') || q.includes('boa tarde') || q.includes('boa noite')) {
      return `Olá! Sou o **Irons**, assistente tático do Meteor 2.0. 🌊

Posso ajudar com informações sobre:
• 🌤️ Tempo e clima de Ilha Comprida, Iguape, Cananéia e Registro
• 🏄 Condições de ondas, swell, maré e spots de surf
• 🚗 Trânsito na SP-222, BR-116 e Balsa Cananeia
• 🏪 Comércio e serviços da região
• 📰 Notícias do Vale do Ribeira
• 🏆 Rankings e eventos da WSL

Como posso ajudar?`;
    }

    // Identidade
    if (q.includes('quem') || q.includes('sobre') || q.includes('faz') || q.includes('qual seu nome')) {
      return `Sou o **Irons**, assistente tático do Meteor 2.0. 🌊

Fui criado em homenagem ao surfistaAndy Irons (1978-2010), tricampeão mundial.

Meu objetivo é fornecer informações rápidas e confiáveis sobre clima, surf, trânsito, comércio e notícias de Ilha Comprida e Vale do Ribeira.

Pergunte sobre qualquer um desses assuntos!`;
    }

    // Clima/Tempo
    if (q.includes('tempo') || q.includes('clima') || q.includes('temperatura') || q.includes(' chuva') || q.includes('vento')) {
      if (context.weather) {
        const w = context.weather;
        let response = `🌤️ **Clima atual:**\n`;
        response += `• Temperatura: ${w.temperature}°C\n`;
        response += `• Umidade: ${w.humidity}%\n`;
        response += `• Vento: ${w.windSpeed}km/h\n`;
        response += `• Condição: ${w.description}\n`;

        if (context.hourly?.next6h) {
          response += `\n⏰ **Próximas horas:**\n`;
          for (const h of context.hourly.next6h.slice(0, 4)) {
            const time = new Date(h.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            response += `• ${time}: ${h.temperature}°C, chuva ${h.precipitationProbability}%\n`;
          }
        }
        return response;
      }
      return `🌤️ Para informações de clima, acesse a tela **Previsão do Tempo** no Meteor 2.0 ou me pergunte sobre uma cidade específica: Ilha Comprida, Iguape, Cananéia ou Registro.`;
    }

    // Surf/Ondas
    if (q.includes('surf') || q.includes('onda') || q.includes('swell') || q.includes('mar') || q.includes('mare')) {
      if (context.ocean) {
        const o = context.ocean;
        let response = `🌊 **Condições do mar:**\n`;
        response += `• Ondas: ${o.waveHeight}m\n`;
        response += `• Qualidade: ${o.qualityLabel}\n`;
        response += `• Melhor horário: ${o.bestTime}\n`;
        response += `• Próxima maré: ${o.nextTide}\n`;
        return response;
      }
      return `🏄 Para condições de surf, acesse a tela **Swell** no Meteor 2.0. Lá você encontra gráficos de ondas, marés, spots e resumo IA com briefing tático.`;
    }

    // Rankings WSL
    if (q.includes('ranking') || q.includes('wsl') || q.includes('campeonato') || q.includes('evento') || q.includes('surfe profissional')) {
      if (context.rankings) {
        let response = `🏆 **Ranking WSL atual:**\n\n`;
        response += `**Masculino (top 5):**\n`;
        for (const r of context.rankings.men.slice(0, 5)) {
          response += `${r.rank}º ${r.name} (${r.country}) — ${r.points} pts\n`;
        }
        response += `\n**Feminino (top 5):**\n`;
        for (const r of context.rankings.women.slice(0, 5)) {
          response += `${r.rank}º ${r.name} (${r.country}) — ${r.points} pts\n`;
        }
        if (context.rankings.events.length > 0) {
          response += `\n**Próximos eventos:**\n`;
          for (const e of context.rankings.events.slice(0, 3)) {
            response += `• ${e.name} — ${e.dates} (${e.status})\n`;
          }
        }
        return response;
      }
      return `🏆 Para rankings e eventos da WSL, acesse a tela **Notícias** no Meteor 2.0. Lá você encontra rankings masculino e feminino, próximos eventos e notícias do surf profissional.`;
    }

    // Trânsito
    if (q.includes('trânsito') || q.includes('transito') || q.includes('rodovia') || q.includes('estrada') || q.includes('balsa') || q.includes('sp-222') || q.includes('br-116')) {
      if (context.traffic) {
        let response = `🚗 **Trânsito na região:**\n`;
        for (const r of context.traffic.routes) {
          const emoji = r.condition === 'LIVRE' ? '🟢' : r.condition === 'MODERADO' ? '🟡' : r.condition === 'LENTO' ? '🟠' : '🔴';
          response += `${emoji} ${r.name}: ${r.condition}\n`;
        }
        return response;
      }
      return `🚗 Para status de trânsito, acesse a tela **Notícias** no Meteor 2.0. Lá você encontra as condições da SP-222, BR-116 e Balsa Cananeia.`;
    }

    // Comércio
    if (q.includes('comércio') || q.includes('comercio') || q.includes('loja') || q.includes('restaurante') || q.includes('pousada') || q.includes('hotel')) {
      if (context.commerce) {
        return `🏪 **Comércio de Ilha Comprida:**\n${context.commerce.total} estabelecimentos cadastrados nos setores: ${context.commerce.sectors.join(', ')}.\n\nAcesse a tela **Comércio** para ver o diretório completo com mapa e rotas.`;
      }
      return `🏪 Para o diretório comercial, acesse a tela **Comércio** no Meteor 2.0. Lá você encontra 50+ estabelecimentos com mapa e rotas.`;
    }

    // Notícias
    if (q.includes('notícia') || q.includes('noticias') || q.includes('noticia') || q.includes('aconteceu') || q.includes('região')) {
      if (context.news) {
        let response = `📰 **Notícias da região:**\n`;
        for (const h of context.news.headlines.slice(0, 3)) {
          response += `• ${h}\n`;
        }
        return response;
      }
      return `📰 Para notícias do Vale do Ribeira, acesse a tela **Notícias** no Meteor 2.0.`;
    }

    // Alertas
    if (q.includes('alerta') || q.includes('perigo') || q.includes('risco') || q.includes('emergência') || q.includes('defesa civil')) {
      if (context.weatherNews?.alerts && context.weatherNews.alerts.length > 0) {
        let response = `⚠️ **Alertas ativos:**\n`;
        for (const a of context.weatherNews.alerts.slice(0, 3)) {
          const emoji = a.type === 'alerta' ? '🔴' : a.type === 'informe' ? '🟡' : '🔵';
          response += `${emoji} ${a.title} (${a.source})\n`;
        }
        return response;
      }
      return `⚠️ Para alertas meteorológicos, verifique a aba **Avisos Meteorológicos** na tela de Previsão do Tempo.`;
    }

    // Previsão
    if (q.includes('amanhã') || q.includes('proximo') || q.includes('previsão') || q.includes('previsao')) {
      if (context.weather) {
        return `🌤️ Para previsão detalhada, acesse a tela **Previsão do Tempo** no Meteor 2.0. Lá você encontra previsão horária (24h) e diária (7 dias) com gráficos e mapa.`;
      }
    }

    // Default
    return `📊 **Consulte os dados em tempo real:** Use as telas do Meteor 2.0 para previsões precisas. Para dúvidas específicas, pergunte sobre:

• 🌤️ Tempo e clima
• 🏄 Ondas e swell
• 💨 Vento e rajadas
• 🚗 Trânsito e rodovias
• 🏪 Comércio local
• 📰 Notícias regionais
• 🏆 Rankings e eventos WSL`;
  }
}
