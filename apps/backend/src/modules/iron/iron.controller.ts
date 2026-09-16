import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { IronService } from './iron.service';

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
});

type ChatResponse = {
  reply: string;
  data?: Record<string, unknown>;
};

@Controller('v1/iron')
export class IronController {
  constructor(private readonly ironService: IronService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: unknown): Promise<ChatResponse> {
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message ?? 'Invalid request');
    }
    return this.ironService.processMessage(parsed.data.message);
  }
}
