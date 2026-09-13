import { Module } from '@nestjs/common';
import { ComercioController } from './comercio.controller';
import { ComercioService } from './comercio.service';
import { ComercioRepository } from './comercio.repository';
import { FallbackModule } from '../../common/fallback/fallback.module';

@Module({
  imports: [FallbackModule],
  controllers: [ComercioController],
  providers: [ComercioService, ComercioRepository],
  exports: [ComercioService],
})
export class ComercioModule {}
