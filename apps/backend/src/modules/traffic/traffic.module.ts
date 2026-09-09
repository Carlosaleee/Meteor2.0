import { Module } from '@nestjs/common';
import { TrafficController } from './traffic.controller';
import { TrafficService } from './traffic.service';
import { TrafficRepository } from './traffic.repository';

@Module({
  controllers: [TrafficController],
  providers: [TrafficService, TrafficRepository],
  exports: [TrafficService],
})
export class TrafficModule {}
