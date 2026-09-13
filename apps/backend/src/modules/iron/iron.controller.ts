import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IronService } from './iron.service';

type ChatRequest = {
  message: string;
};

type ChatResponse = {
  reply: string;
  data?: Record<string, unknown>;
};

@Controller('v1/iron')
export class IronController {
  constructor(private readonly ironService: IronService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: ChatRequest): Promise<ChatResponse> {
    const { message } = body;
    return this.ironService.processMessage(message);
  }
}
