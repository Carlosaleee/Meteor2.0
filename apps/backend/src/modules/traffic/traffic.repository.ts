import { Injectable } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-traffic.json';

type TrafficRoute = {
  id: string;
  name: string;
  stretch: string;
  baseCondition: string;
  description: string;
  baseWaitMinutes?: number;
  rushHours: {
    morning: { start: number; end: number; condition: string; description: string; waitMinutes?: number };
    evening: { start: number; end: number; condition: string; description: string; waitMinutes?: number };
  };
};

type TrafficRouteResponse = {
  id: string;
  name: string;
  stretch: string;
  condition: string;
  description: string;
  updatedAt: number;
  waitTimeMinutes?: number;
};

@Injectable()
export class TrafficRepository {
  constructor(private readonly fallback: FallbackService) {}

  async getTrafficStatus() {
    const fallbackData = this.fallback.load<{ routes: TrafficRoute[] }>(FALLBACK_FILE);
    const routes = fallbackData?.routes ?? this.getDefaultRoutes();

    const now = new Date();
    const hour = now.getHours();

    const resolved: TrafficRouteResponse[] = routes.map(route => {
      const rush = this.getRushConfig(route, hour);
      return {
        id: route.id,
        name: route.name,
        stretch: route.stretch,
        condition: rush?.condition ?? route.baseCondition,
        description: rush?.description ?? route.description,
        updatedAt: now.getTime(),
        waitTimeMinutes: rush?.waitMinutes ?? route.baseWaitMinutes,
      };
    });

    return {
      timestamp: now.toISOString(),
      location: 'Vale do Ribeira',
      routes: resolved,
    };
  }

  private getRushConfig(route: TrafficRoute, hour: number): { condition: string; description: string; waitMinutes?: number } | null {
    const { morning, evening } = route.rushHours;

    if (hour >= morning.start && hour < morning.end) {
      return { condition: morning.condition, description: morning.description, waitMinutes: morning.waitMinutes };
    }
    if (hour >= evening.start && hour < evening.end) {
      return { condition: evening.condition, description: evening.description, waitMinutes: evening.waitMinutes };
    }
    return null;
  }

  private getDefaultRoutes(): TrafficRoute[] {
    return [
      {
        id: 'sp-222',
        name: 'Rodovia SP-222',
        stretch: 'Iguape ⇄ Cananéia',
        baseCondition: 'LIVRE',
        description: 'Tráfego fluindo normalmente sem retenções.',
        rushHours: {
          morning: { start: 7, end: 9, condition: 'MODERADO', description: 'Fluxo intenso de veículos leves.' },
          evening: { start: 17, end: 19, condition: 'MODERADO', description: 'Retorno do trabalho, tráfego intenso.' },
        },
      },
      {
        id: 'br-116',
        name: 'Rodovia Régis Bittencourt (BR-116)',
        stretch: 'Trecho Registro',
        baseCondition: 'MODERADO',
        description: 'Fluxo intenso de veículos pesados na serra.',
        rushHours: {
          morning: { start: 6, end: 10, condition: 'LENTO', description: 'Caminhões e veículos pesados na subida da serra.' },
          evening: { start: 15, end: 20, condition: 'LENTO', description: 'Descida de veículos pesados, risco de lentidão.' },
        },
      },
      {
        id: 'balsa-cananeia',
        name: 'Travessia de Balsa',
        stretch: 'Cananéia ⇄ Ilha Comprida',
        baseCondition: 'OPERACIONAL',
        description: 'Tempo de espera estimado: 15 min',
        baseWaitMinutes: 15,
        rushHours: {
          morning: { start: 7, end: 9, condition: 'OPERACIONAL', description: 'Fila moderada, espera de 20-30 min.', waitMinutes: 25 },
          evening: { start: 17, end: 19, condition: 'OPERACIONAL', description: 'Fila leve, espera de 15-20 min.', waitMinutes: 18 },
        },
      },
    ];
  }
}
