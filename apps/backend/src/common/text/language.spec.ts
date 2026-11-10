import { isPortuguese, filterPortuguese } from './language';

describe('isPortuguese', () => {
  it('deve aceitar manchetes claramente em portugues', () => {
    expect(isPortuguese('Simmers e Medina coroados no Finals Day do Philippines Pro')).toBe(true);
    expect(isPortuguese('Medina vence final com tubo 9.43 e chega mais perto do tetra mundial')).toBe(true);
    expect(isPortuguese('Transito na SP-165 causa engarrafamento na altura de Registro')).toBe(true);
    expect(isPortuguese('Defesa Civil emite alerta de tempestade para o Vale do Ribeira')).toBe(true);
  });

  it('deve rejeitar manchetes claramente em ingles', () => {
    expect(isPortuguese('Simmers and Medina crowned world champions in the Philippines')).toBe(false);
    expect(isPortuguese('Pipeline awaits the top 16 surfers for the final day')).toBe(false);
    expect(isPortuguese('The WSL forecast for tomorrow morning')).toBe(false);
  });

  it('deve rejeitar manchetes claramente em espanhol', () => {
    expect(isPortuguese('Simmers y Medina coronados campeones del mundo')).toBe(false);
    expect(isPortuguese('La final del campeonato llega a las costas de Sao Paulo')).toBe(false);
    expect(isPortuguese('Los surfistas llegan a la region con el regreso del mar')).toBe(false);
  });

  it('deve manter textos sem marcadores de idioma (nao descartar por duvida)', () => {
    expect(isPortuguese('Cloud 9')).toBe(true);
    expect(isPortuguese('')).toBe(true);
    expect(isPortuguese('WSL Philippines Pro')).toBe(true);
  });

  it('deve deixar o sinal positivo de portugues vencer marcadores estrangeiros', () => {
    expect(isPortuguese('Brazil e o Brasil dominam o WSL neste final')).toBe(true);
    expect(isPortuguese('Maresias recebe o WSL Sunset com shows de Planta e Raiz')).toBe(true);
  });

  it('nao deve considerar acentos como sinal isolado', () => {
    expect(isPortuguese('Ipê, açaí e ação em São Sebastião')).toBe(true);
  });
});

describe('filterPortuguese', () => {
  it('deve manter apenas os itens em portugues', () => {
    const items = [
      { title: 'Praia de Peruibe recebe etapa do circuito paulista de surf' },
      { title: 'The forecast for the week ahead on the coast' },
      { title: 'Vento forte de procedencia sul no litoral de Sao Paulo' },
      { title: 'Los mejores surfistas del mundo llegan a la region' },
    ];

    const result = filterPortuguese(items, item => item.title);

    expect(result).toHaveLength(2);
    expect(result[0].title).toContain('Peruibe');
    expect(result[1].title).toContain('Vento forte');
  });
});
