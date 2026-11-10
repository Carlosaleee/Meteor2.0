import { isPortuguese } from './language';

/**
 * Amostra de manchetes reais (pt-BR) que precisam sobreviver ao filtro,
 * junto de examples em ingles/espanhol que precisam ser descartados.
 */
describe('isPortuguese — amostra real', () => {
  const PT_SAMPLES = [
    'Simmers e Medina coroados no Finals Day do Philippines Pro em Cloud 9',
    'Medina vence final com tubo 9.43 e chega mais perto do tetra mundial',
    'Caity Simmers conquista primeiro titulo da temporada no Philippines Pro',
    'Highlights: Philippines Pro fecha etapa historica com espetaculo em Cloud 9',
    'GWM Catch Up Finals Day: Medina e Simmers emocionam torcida nas Filipinas',
    'Philippines Pro: 11a parada do CT chega a Cloud 9, em Siargao',
    'Revisao da Finals Day: airshow de Medina contra Yago Dora na semi',
    'Interferencia de prioridade define semifinal e leva Simmers a final',
    'Simmers abre o primeiro CT das Filipinas com 9.00 em Cloud 9',
    'Robinson garante final no Philippines Pro apos duelo contra Ewing',
    'Banco do Brasil Sao Sebastiao Pro: WSL chega a SP pela primeira vez',
    'Hang Loose Surf Attack 2026: etapa decisiva em Maresias',
    'WSL Sunset Reggae Edition chega a Maresias com Maneva e Planta & Raiz',
    'Longboard Paulista Pro 2026 sera realizado em Peruibe',
    'Circuito Santos de Surf 2026 coroa campeoes em nove categorias',
    'SPSurf passa a ser nova entidade reguladora do surfe em Sao Paulo',
    'Transito na SP-165 causa engarrafamento na altura de Registro',
    'Balsa de Cananeia tem operacao suspensa por causa da neblina',
    'Defesa Civil emite alerta de chuva forte para o litoral sul paulista',
    'Acidente na BR-116 deixa duas pessoas feridas em Ribeirao Grande',
    'Praia de Peruibe recebe tourists neste fim de semana de verao',
    'Usa e))* pra surfar? Confira as condicoes do mar em Ilha Comprida',
    'Vento de procedencia sul traz ondas de 2 metros para o litoral',
    'Prefeitura de Cananeia abre inscricoes para o circuito de surf',
    'Marquesina de buses passa a atender a rodovia SP-165 com novas horarios',
  ];

  const NON_PT_SAMPLES = [
    'Simmers and Medina crowned world champions in the Philippines',
    'Pipeline awaits the top 16 surfers for the final day of competition',
    'The WSL forecast for tomorrow morning on the coast',
    'Which surfers are through to the semifinals of the world championship',
    'World Surf League announces new schedule for the 2026 season',
    'Simmers y Medina coronados campeones del mundo en Filipinas',
    'La final del campeonato llega a las costas de Sao Paulo',
    'Los mejores surfistas del mundo llegan a la region con el regreso del mar',
    'El evento de surf mas importante del año se disputa en Pipeline',
    'Las clasificaciones del campeonato se agrupan tras la primera jornada',
    // Regressao: manchete em espanhol que passou pelo filtro por conter
    // palavras que tambem existem em portugues ("realiza", "presenta", "plan").
    "RDV Surf realiza con éxito el 'WSL Sponsor Summit 2026' y presenta su plan estrategico 2027",
    'El navegador de surf más rápido del mundo ya está disponible en el mercado',
  ];

  it('nao deve descartar manchetes reais em portugues', () => {
    const rejected = PT_SAMPLES.filter(s => !isPortuguese(s));
    expect(rejected).toEqual([]);
  });

  it('nao deve deixar passar manchetes em ingles ou espanhol', () => {
    const accepted = NON_PT_SAMPLES.filter(s => isPortuguese(s));
    expect(accepted).toEqual([]);
  });
});
