import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { IronService } from './iron.service';

const ChatTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  /** Histórico recente da conversa (o cliente mantém o estado; o backend é stateless). */
  history: z.array(ChatTurnSchema).max(20).optional(),
  /** Identificador do cliente — apenas para observabilidade/logs. */
  sessionId: z.string().min(1).max(64).optional(),
});

type ChatResponse = {
  reply: string;
  data?: Record<string, unknown>;
  sources?: Array<{
    title: string;
    section?: string;
    source: 'docs' | 'data';
    snippet: string;
  }>;
};

@Controller('v1/iron')
export class IronController {
  constructor(private readonly ironService: IronService) {}

  // Chat custa 1 chamada Gemini por request — limite dedicado (5/min por IP),
  // mais restritivo que o global de 60/min.
  @Post('chat')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: unknown): Promise<ChatResponse> {
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message ?? 'Invalid request');
    }
    const { message, history, sessionId } = parsed.data;
    return this.ironService.processMessage(message, history, sessionId);
  }
}
