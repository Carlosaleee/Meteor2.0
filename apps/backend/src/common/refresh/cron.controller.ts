import { Controller, Get, Post, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { RefreshService } from './refresh.service';

@Controller('v1/cron')
export class CronController {
  constructor(private readonly refreshService: RefreshService) {}

  @Get('status')
  getStatus() {
    return this.refreshService.getStatus();
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Headers('x-cron-secret') secret?: string) {
    const expected = process.env.CRON_SECRET || 'meteor-refresh-secret';
    if (secret !== expected) {
      return { error: 'Unauthorized', message: 'Invalid CRON_SECRET' };
    }

    this.logger.log('Manual refresh triggered via endpoint');
    return this.refreshService.refreshAll();
  }

  private readonly logger = { log: console.log, warn: console.warn, error: console.error };
}
