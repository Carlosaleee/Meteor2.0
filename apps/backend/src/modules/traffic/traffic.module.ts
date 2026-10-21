import { Module } from '@nestjs/common';
import { TrafficController } from './traffic.controller';
import { TrafficService } from './traffic.service';
import { TrafficRepository } from './traffic.repository';
import { ArtspWazeRepository } from './artsp-waze.repository';

@Module({
  controllers: [TrafficController],
  providers: [TrafficService, TrafficRepository, ArtspWazeRepository],
  exports: [TrafficService, ArtspWazeRepository],
})
export class TrafficModule {}
