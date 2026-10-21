import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiContextBuilder {
  /**
   * Builds a minimal context to pass to Gemini. Current implementation returns
   * an empty context, ensuring type safety while allowing future
   * enrichment without breaking the API contract.
   */
  async buildContext(_history: any[]): Promise<any> {
    return {};
  }
}
