import { Module } from '@nestjs/common';
import { OceanographyController } from './oceanography.controller';
import { OceanographyService } from './oceanography.service';
import { MarineRepository } from './marine.repository';
import { GeminiRepository } from './gemini.repository';

@Module({
  controllers: [OceanographyController],
  providers: [OceanographyService, MarineRepository, GeminiRepository],
  exports: [OceanographyService],
})
export class OceanographyModule {}
