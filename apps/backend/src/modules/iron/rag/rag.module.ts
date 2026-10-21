import { Module } from '@nestjs/common';
import { FallbackModule } from '../../../common/fallback/fallback.module';
import { IndexStore } from './index.store';
import { RagService } from './rag.service';

@Module({
  imports: [FallbackModule],
  providers: [IndexStore, RagService],
  exports: [RagService],
})
export class RagModule {}
