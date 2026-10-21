import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Headers,
  Query,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
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
  async refresh(
    @Headers('x-cron-secret') secret?: string,
    @Headers('authorization') authorization?: string,
    @Query('scope') scope?: string,
  ) {
    return this.runRefresh(this.extractSecret(secret, authorization), scope);
  }

  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshFromCron(
    @Headers('x-cron-secret') secret?: string,
    @Headers('authorization') authorization?: string,
    @Query('secret') querySecret?: string,
    @Query('scope') scope?: string,
  ) {
    return this.runRefresh(this.extractSecret(secret ?? querySecret, authorization), scope);
  }

  /**
   * Fontes aceitas (todas exigem o valor real de CRON_SECRET):
   * - `Authorization: Bearer <secret>` — mecanismo nativo dos crons da Vercel
   * - `x-cron-secret: <secret>` — uso manual/legado
   * - `?secret=<secret>` — uso manual via GET
   *
   * O header `x-vercel-cron: 1` NAO autoriza mais: e spoofavel por qualquer cliente.
   */
  private extractSecret(headerSecret?: string, authorization?: string): string | undefined {
    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice('Bearer '.length).trim();
    }
    return headerSecret;
  }

  private async runRefresh(secret?: string, scope?: string) {
    const expected = process.env.CRON_SECRET;
    if (!expected) {
      this.logger.error('CRON_SECRET nao configurado — refresh negado');
      throw new UnauthorizedException('CRON_SECRET not configured');
    }
    if (!secret || secret !== expected) {
      this.logger.warn('Tentativa de refresh com secret invalido');
      throw new UnauthorizedException('Invalid CRON_SECRET');
    }

    this.logger.log(`Refresh triggered (scope=${scope ?? 'all'})`);
    if (scope === 'news') {
      return this.refreshService.refreshNews();
    }
    return this.refreshService.refreshAll();
  }
}
