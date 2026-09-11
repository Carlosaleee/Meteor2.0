import { Module } from '@nestjs/common';
import { LocalismoController } from './localismo.controller';
import { LocalismoService } from './localismo.service';
import { LocalismoRepository } from './localismo.repository';
import { FallbackModule } from '../../common/fallback/fallback.module';

@Module({
  imports: [FallbackModule],
  controllers: [LocalismoController],
  providers: [LocalismoService, LocalismoRepository],
})
export class LocalismoModule {}
