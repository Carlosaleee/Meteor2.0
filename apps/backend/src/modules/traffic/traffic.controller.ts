import { Controller, Get } from '@nestjs/common';
import { TrafficService } from './traffic.service';

@Controller('v1/traffic')
export class TrafficController {
  constructor(private readonly trafficService: TrafficService) {}

  @Get()
  async getTraffic() {
    return await this.trafficService.getTraffic();
  }
}
