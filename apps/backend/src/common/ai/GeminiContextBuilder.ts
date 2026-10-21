import { Injectable } from '@nestjs/common';
import type { ChatContext, ChatTurn } from '../../modules/iron/gemini-chat.repository';

@Injectable()
export class GeminiContextBuilder {
  /**
   * Builds the minimal context passed to Gemini. Current implementation
   * returns an empty context, keeping the API contract type-safe while
   * allowing future enrichment without breaking callers.
   */
  async buildContext(_history: ChatTurn[]): Promise<ChatContext> {
    return {};
  }
}
