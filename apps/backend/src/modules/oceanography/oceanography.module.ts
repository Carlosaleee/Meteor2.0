import { Module } from '@nestjs/common';
import { OceanographyController } from './oceanography.controller';
import { OceanographyService } from './oceanography.service';
import { MarineRepository } from './marine.repository';

@Module({
  controllers: [OceanographyController],
  providers: [OceanographyService, MarineRepository],
  exports: [OceanographyService],
})
export class OceanographyModule {}
