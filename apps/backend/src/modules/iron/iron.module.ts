import { Module } from '@nestjs/common';
import { IronController } from './iron.controller';
import { IronService } from './iron.service';
import { GeminiChatRepository } from './gemini-chat.repository';
import { RagModule } from './rag/rag.module';
import { MeteorologyModule } from '../meteorology/meteorology.module';
import { OceanographyModule } from '../oceanography/oceanography.module';
import { TrafficModule } from '../traffic/traffic.module';
import { ComercioModule } from '../comercio/comercio.module';
import { NoticiasRegionaisModule } from '../noticias-regionais/noticias-regionais.module';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [
    MeteorologyModule,
    OceanographyModule,
    TrafficModule,
    ComercioModule,
    NoticiasRegionaisModule,
    NewsModule,
    RagModule,
  ],
  controllers: [IronController],
  providers: [IronService, GeminiChatRepository],
  exports: [IronService],
})
export class IronModule {}
