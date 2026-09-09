import { Injectable } from '@nestjs/common';

@Injectable()
export class TrafficRepository {
  async getTrafficStatus() {
    // Simulação de dados em tempo real das rodovias do Vale do Ribeira e Balsas
    return {
      timestamp: new Date().toISOString(),
      routes: [
        {
          id: 'sp-222',
          name: 'Rodovia SP-222',
          stretch: 'Iguape ⇄ Cananéia',
          condition: 'LIVRE',
          description: 'Tráfego fluindo normalmente sem retenções.',
          updatedAt: Date.now(),
        },
        {
          id: 'br-116',
          name: 'Rodovia Régis Bittencourt (BR-116)',
          stretch: 'Trecho Registro',
          condition: 'MODERADO',
          description: 'Fluxo intenso de veículos pesados na serra.',
          updatedAt: Date.now(),
        },
        {
          id: 'balsa-cananeia',
          name: 'Travessia de Balsa',
          stretch: 'Cananéia ⇄ Ilha Comprida',
          condition: 'OPERACIONAL',
          description: 'Tempo de espera estimado: 15 min',
          waitTimeMinutes: 15,
          updatedAt: Date.now(),
        },
      ],
    };
  }
}
