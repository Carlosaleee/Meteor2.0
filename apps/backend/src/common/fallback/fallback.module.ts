import { Module, Global } from '@nestjs/common';
import { FallbackService } from './fallback.service';

@Global()
@Module({
  providers: [FallbackService],
  exports: [FallbackService],
})
export class FallbackModule {}
