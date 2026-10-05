import { Controller, Get, Post, HttpCode, HttpStatus, Headers, Query, Logger } from '@nestjs/common';
import { RefreshService } from './refresh.service';

@Controller('v1/cron')
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(private readonly refreshService: RefreshService) {}

  @Get('status')
  getStatus() {
    return this.refreshService.getStatus();
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Headers('x-cron-secret') secret?: string, @Query('scope') scope?: string) {
    return this.runRefresh(secret, undefined, scope);
  }

  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshFromCron(
    @Headers('x-cron-secret') secret?: string,
    @Headers('x-vercel-cron') vercelCron?: string,
    @Query('secret') querySecret?: string,
    @Query('scope') scope?: string,
  ) {
    return this.runRefresh(secret ?? querySecret, vercelCron, scope);
  }

  private async runRefresh(secret?: string, vercelCron?: string, scope?: string) {
    const expected = process.env.CRON_SECRET || 'meteor-refresh-secret';
    if (secret !== expected && vercelCron !== '1') {
      return { error: 'Unauthorized', message: 'Invalid CRON_SECRET' };
    }

    this.logger.log(`Refresh triggered (scope=${scope ?? 'all'}, source=${secret ? 'secret' : 'vercel-cron'})`);
    if (scope === 'news') {
      return this.refreshService.refreshNews();
    }
    return this.refreshService.refreshAll();
  }
}
