import { Injectable } from '@nestjs/common';
import { TrafficRepository } from './traffic.repository';

@Injectable()
export class TrafficService {
  constructor(private readonly trafficRepo: TrafficRepository) {}

  async getTraffic() {
    return await this.trafficRepo.getTrafficStatus();
  }
}
