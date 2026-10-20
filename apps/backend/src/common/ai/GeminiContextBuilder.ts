import { Injectable } from '@nestjs/common';
import { MeteorologyService } from '../../modules/meteorology/meteorology.service';
import { OceanographyService } from '../../modules/oceanography/oceanography.service';
import { TrafficService } from '../../modules/traffic/traffic.service';
import { ComercioService } from '../../modules/comercio/comercio.service';
import { NoticiasRegionaisService } from '../../modules/noticias-regionais/noticias-regionais.service';

@Injectable()
export class GeminiContextBuilder {
  constructor(
    private readonly meteorology: MeteorologyService,
    private readonly oceanography: OceanographyService,
    private readonly traffic: TrafficService,
    private readonly comercio: ComercioService,
    private readonly noticias: NoticiasRegionaisService,
  ) {}

  async buildContext(userHistory?: any[]): Promise<string> {
    const [meteo, ocean, traffic, comercio, news] = await Promise.all([
      this.meteorology.getLatestSummary(),
      this.oceanography.getLatestSummary(),
      this.traffic.getStatus(),
      this.comercio.getSummary(),
      this.noticias.getSummary(),
    ]);

    const contextParts: string[] = [];
    contextParts.push(`METEORLOGY – ${meteo.location} (Sunrise ${meteo.sunrise}, Temp ${meteo.tempMax}°C, Wind ${meteo.windSpeed} km/h)`);
    contextParts.push(`OCEANOGRAPHY – Wave ${ocean.current.waveHeight} m, Swell ${ocean.current.swellHeight} m, Best ${ocean.bestTime}`);
    const trafficStr = traffic.routes.slice(0, 3).map(r => `${r.id.toUpperCase()}: ${r.condition}`).join(', ');
    contextParts.push(`TRAFFIC – ${trafficStr}`);
    contextParts.push(`COMERCIO – ${comercio.sectors} sectors, ${comercio.total} stores`);
    const newsStr = news.headlines.slice(0, 3).map(n => n.title).join(' | ');
    contextParts.push(`NOTICIAS – ${newsStr}`);
    return contextParts.join('\n');
  }
}
