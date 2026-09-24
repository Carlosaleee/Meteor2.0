/**
 * IRONS Knowledge Base
 * Documentação completa do sistema Meteor 2.0 para o agente de IA.
 * Em homenagem ao surfista Andy Irons (1978-2010).
 */

export const IRONS_KNOWLEDGE = {
  agent: {
    name: 'Irons',
    fullName: 'Irons — Assistente Tático de Surf & Clima',
    description: 'Assistente de IA do Meteor 2.0, criado em homenagem ao surfista Andy Irons. Fornece informações em tempo real sobre clima, surf, trânsito e comércio de Ilha Comprida e Vale do Ribeira.',
    capabilities: [
      'Previsão meteorológica em tempo real',
      'Condições de ondas e swell',
      'Análise de vento para surf/kite/windsurf',
      'Status de trânsito e rodovias',
      'Diretório comercial local',
      'Notícias regionais',
    ],
  },

  screens: {
    principal: {
      name: 'Portal Principal',
      route: '/',
      description: 'Dashboard principal com visão geral de todas as métricas.',
      sections: [
        'Hero Carousel — banner rotativo com imagens da região',
        'Resumo IA — briefing executivo gerado por Gemini',
        'Condições de Ondas — 5 cards com altura, período, direção, swell, qualidade',
        'Condições de Vento — 5 cards com velocidade, rajada, direção, Beaufort, qualidade surf',
        'Próximas Horas — grid 12h com previsão de ondas',
        'Todos os Points — 6 spots de surf mapeados',
        'Notícias de Surf — 3 cards de notícias WSL/Circuito Paulista',
        'Status das Rodovias — SP-222, BR-116, Balsa Cananeia',
        'Notícias Regionais — 12 notícias do Vale do Ribeira',
        'Comércio Local — 50 estabelecimentos de Ilha Comprida',
      ],
    },

    meteorologia: {
      name: 'Meteorologia',
      route: '/meteorologia',
      description: 'Previsão do tempo detalhada para 4 cidades da região.',
      cities: [
        { id: 'ilha-comprida', name: 'Ilha Comprida', lat: -24.73, lon: -47.55 },
        { id: 'iguape', name: 'Iguape', lat: -24.70, lon: -47.55 },
        { id: 'cananeia', name: 'Cananéia', lat: -25.01, lon: -47.92 },
        { id: 'registro', name: 'Registro', lat: -24.48, lon: -47.84 },
      ],
      tabs: [
        { id: 'avisos', name: 'Avisos', description: 'Alertas oficiais INMET, Defesa Civil, Marinha' },
        { id: 'previsao', name: 'Previsão', description: 'Mapa, métricas, hourly 24h, daily 7 dias' },
        { id: 'satelite', name: 'Satélite', description: 'Imagens de satélite CPTEC/INPE' },
        { id: 'numerica', name: 'Numérica', description: 'Modelos numéricos com radar RainViewer' },
      ],
      metrics: [
        'Temperatura atual e sensação térmica',
        'Umidade relativa do ar',
        'Velocidade e direção do vento',
        'Precipitação atual (chuva)',
        'Pressão atmosférica',
        'Cobertura de nuvens',
        'Visibilidade',
        'Índice UV',
      ],
      dataSources: ['Open-Meteo Forecast', 'RainViewer Radar', 'INMET Avisos', 'CPTEC/INPE'],
    },

    swell: {
      name: 'Swell & Points',
      route: '/swell',
      description: 'Condições oceânicas completas para surf, kite e windsurf.',
      tabs: [
        { id: 'overview', name: 'Visão Geral', description: 'Resumo IA + condições + vento + points + notícias' },
        { id: 'news', name: 'Notícias', description: 'WSL Rankings + Circuito Paulista + Eventos' },
        { id: 'forecast', name: 'Previsão de Ondas', description: 'Gráfico hourly + conditions + marés' },
        { id: 'wind', name: 'Previsão de Ventos', description: 'Gráfico vento + hourly wind + marés' },
        { id: 'spots', name: 'Points', description: 'Mapa + grid de spots com filtros' },
      ],
      metrics: [
        'Altura da onda (waveHeight)',
        'Período da onda (wavePeriod)',
        'Direção da onda (waveDirection)',
        'Altura do swell (swellHeight)',
        'Período do swell (swellPeriod)',
        'Direção do swell (swellDirection)',
        'Velocidade do vento (windSpeed)',
        'Direção do vento (windDirection)',
        'Rajada (windGust)',
        'Próxima maré alta/baixa',
        'Coeficiente de maré',
      ],
      spots: [
        { id: 'jureia', name: 'Praia da Juréia', level: 'advanced', bestWind: 'Oeste (Terral)' },
        { id: 'ponta-norte', name: 'Ponta da Praia Norte', level: 'beginner', bestWind: 'Sudoeste' },
        { id: 'boqueirao-norte', name: 'Boqueirão Norte', level: 'intermediate', bestWind: 'Oeste (Terral)' },
        { id: 'boqueirao-sul', name: 'Boqueirão Sul', level: 'advanced', bestWind: 'Noroeste (Terral)' },
        { id: 'costao-sul', name: 'Costão do Sul', level: 'intermediate', bestWind: 'Oeste (Terral)' },
        { id: 'parada-surf', name: 'Parada do Surf', level: 'beginner', bestWind: 'Qualquer' },
      ],
      dataSources: ['Open-Meteo Marine', 'Gemini AI Briefing', 'Leaflet + OpenStreetMap'],
    },

    noticias: {
      name: 'Notícias Regionais',
      route: '/noticias',
      description: 'Notícias do Vale do Ribeira e status de trânsito.',
      features: [
        '12 notícias regionais categorizadas',
        'TrafficMap interativo com Leaflet',
        'CityGrid com notícias meteorológicas',
        'Filtros por categoria (trânsito, policial, turismo, cotidiano)',
      ],
      categories: ['transito', 'noticia', 'policial', 'turismo', 'cotidiano'],
      routes: [
        { id: 'sp-222', name: 'SP-222', description: 'Rodovia do Vale do Ribeira' },
        { id: 'sp-055', name: 'SP-055', description: 'Rodovia de acesso' },
        { id: 'br-116', name: 'BR-116', description: 'Régis Bittencourt' },
        { id: 'balsa-cananeia', name: 'Balsa Cananeia', description: 'Travessia aquatic' },
      ],
      dataSources: ['Fallback regional (dados estáticos)'],
    },

    comercio: {
      name: 'Comércio Local',
      route: '/comercio',
      description: 'Diretório comercial de Ilha Comprida com mapa interativo.',
      sectors: [
        { id: 'alimentacao', name: 'Alimentação', icon: '🍽️' },
        { id: 'hospedagem', name: 'Hospedagem', icon: '🏨' },
        { id: 'comercio', name: 'Comércio', icon: '🏪' },
        { id: 'servicos', name: 'Serviços', icon: '🔧' },
        { id: 'lazer', name: 'Lazer', icon: '🎯' },
      ],
      totalBusinesses: 50,
      features: [
        'CommerceMap com Leaflet',
        'Routing OSRM para direcionamento',
        'Filtros por setor',
        'Geolocalização de cada estabelecimento',
      ],
      dataSources: ['Fallback comercio (50 comércios)'],
    },

    blog: {
      name: 'Blog Técnico',
      route: '/blog',
      description: 'Artigos técnicos sobre meteorologia e oceanografia.',
      articles: 4,
    },

    creditos: {
      name: 'Créditos & Fontes',
      route: '/creditos',
      description: 'Transparência de dados e stack tecnológica.',
      sections: ['Fontes de Dados', 'Stack Tecnológica', 'Licenças'],
    },

    mapa: {
      name: 'Mapa de Localizações',
      route: '/mapa',
      description: 'Mapa interativo com 6 marcadores da região.',
      markers: 6,
    },
  },

  backend: {
    modules: {
      meteorology: {
        name: 'MeteorologyModule',
        endpoint: 'GET /v1/meteorology?locationId=',
        description: 'Dados meteorológicos (current + hourly 24h + daily 7 dias)',
        locations: ['ilha-comprida', 'iguape', 'cananeia', 'registro'],
        fallback: 'fallback-meteorology.json',
      },
      oceanography: {
        name: 'OceanographyModule',
        endpoints: [
          'GET /v1/oceanography — dados atuais (ondas, swell, qualidade, spots)',
          'GET /v1/oceanography/hourly — previsão hourly 12h',
          'GET /v1/oceanography/summary — resumo tático Gemini AI',
        ],
        fallback: 'fallback-oceanography.json',
      },
      traffic: {
        name: 'TrafficModule',
        endpoint: 'GET /v1/traffic',
        description: 'Status de rodovias (simulado por horário)',
        fallback: 'fallback-traffic.json',
      },
      noticiasRegionais: {
        name: 'NoticiasRegionaisModule',
        endpoint: 'GET /v1/noticias-regionais',
        description: '12 notícias regionais + 4 rotas de trânsito',
        fallback: 'fallback-noticias-regionais.json',
      },
      comercio: {
        name: 'ComercioModule',
        endpoint: 'GET /v1/comercio',
        description: '50 comércios de Ilha Comprida (5 setores)',
        fallback: 'fallback-comercio.json',
      },
    },

    architecture: 'Controller > Service > Repository (3 camadas)',
    resilience: 'FallbackService com JSONs diários, verificação de stale (>24h)',
    security: 'Helmet, CORS, Throttler (60 req/min, loopback isento)',
    validation: 'Zod (env schema + pipes)',
  },

  data: {
    locations: [
      { id: 'ilha-comprida', name: 'Ilha Comprida', lat: -24.73, lon: -47.55, description: 'Principal cidade da região, praia de 17km' },
      { id: 'iguape', name: 'Iguape', lat: -24.70, lon: -47.55, description: 'Município histórico do Vale do Ribeira' },
      { id: 'cananeia', name: 'Cananéia', lat: -25.01, lon: -47.92, description: 'Cidade costeira com ecossistema preservado' },
      { id: 'registro', name: 'Registro', lat: -24.48, lon: -47.84, description: 'Interior do Vale do Ribeira' },
    ],

    surfSpots: [
      { name: 'Juréia', level: 'advanced', exposure: 'Leste — mar aberto', bestWind: 'Oeste (Terral)' },
      { name: 'Ponta da Praia Norte', level: 'beginner', exposure: 'Protegida', bestWind: 'Sudoeste' },
      { name: 'Boqueirão Norte', level: 'intermediate', exposure: 'SE', bestWind: 'Oeste (Terral)' },
      { name: 'Boqueirão Sul', level: 'advanced', exposure: 'SE', bestWind: 'Noroeste (Terral)' },
      { name: 'Costão do Sul', level: 'intermediate', exposure: 'Sul', bestWind: 'Oeste (Terral)' },
      { name: 'Parada do Surf', level: 'beginner', exposure: 'Protegida', bestWind: 'Qualquer' },
    ],

    trafficRoutes: [
      { id: 'sp-222', name: 'SP-222', stretch: 'Registro - Iguape' },
      { id: 'sp-055', name: 'SP-055', stretch: 'Acesso litoral' },
      { id: 'br-116', name: 'BR-116', stretch: 'Régis Bittencourt' },
      { id: 'balsa-cananeia', name: 'Balsa Cananeia', stretch: 'Travessia aquatic' },
    ],
  },

  weather: {
    codes: {
      0: 'Céu limpo',
      1: 'Principalmente limpo',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Nevoeiro',
      48: 'Nevoeiro com geada',
      51: 'Chuva leve',
      53: 'Chuva moderada',
      55: 'Chuva forte',
      61: 'Chuva leve',
      63: 'Chuva moderada',
      65: 'Chuva forte',
      80: 'Pancadas leves',
      81: 'Pancadas moderadas',
      82: 'Pancadas fortes',
      95: 'Tempestade',
      96: 'Tempestade com granizo',
      99: 'Tempestade com granizo forte',
    },

    windQuality: [
      { min: 0, max: 6, label: 'Calmo', kitesurf: 'Insuficiente', surf: 'Ótimo' },
      { min: 6, max: 12, label: 'Leve', kitesurf: 'Insuficiente', surf: 'Bom' },
      { min: 12, max: 20, label: 'Moderado', kitesurf: 'Bom', surf: 'Regular' },
      { min: 20, max: 30, label: 'Forte', kitesurf: 'Ótimo', surf: 'Onshore' },
      { min: 30, max: 40, label: 'Muito Forte', kitesurf: 'Perigoso', surf: 'Perigoso' },
      { min: 40, max: 999, label: 'Tempestuoso', kitesurf: 'Extremamente Perigoso', surf: 'Extremamente Perigoso' },
    ],

    beaufort: [
      { force: 0, speed: '< 1', description: 'Calmo' },
      { force: 1, speed: '1-5', description: 'Ar leve' },
      { force: 2, speed: '6-11', description: 'Brisa leve' },
      { force: 3, speed: '12-19', description: 'Brisa suave' },
      { force: 4, speed: '20-28', description: 'Brisa moderada' },
      { force: 5, speed: '29-38', description: 'Brisa fresca' },
      { force: 6, speed: '39-49', description: 'Brisa forte' },
      { force: 7, speed: '50-60', description: 'Vento próximo a tempestade' },
    ],
  },

  api: {
    external: [
      { name: 'Open-Meteo', type: 'Weather + Marine', url: 'https://open-meteo.com', cost: 'Gratuita' },
      { name: 'RainViewer', type: 'Radar', url: 'https://www.rainviewer.com', cost: 'Gratuita' },
      { name: 'Gemini', type: 'IA', url: 'https://ai.google.dev', cost: 'Gratuita (tier)' },
      { name: 'OpenStreetMap', type: 'Tiles', url: 'https://www.openstreetmap.org', cost: 'Gratuita' },
      { name: 'OSRM', type: 'Routing', url: 'http://project-osrm.org', cost: 'Gratuita' },
    ],
  },

  design: {
    palette: {
      dark: { bg: '#0A0A0A', graphite: '#141414', surface: '#1C1C1C', line: '#2A2A2A', ink: '#E8E4DC', orange: '#FF6A1A', gold: '#E0B429' },
      light: { bg: '#D6D0C8', graphite: '#F5F3EE', surface: '#DDD9D0', line: '#C4BFB5', ink: '#1A1A1A', orange: '#E05A10', gold: '#B08A18' },
    },
    typography: { display: 'Archivo Black', mono: 'JetBrains Mono' },
    rules: [
      'Border-radius: 0px default, 2px máximo',
      'Sem glassmorphism',
      'Sem purple/violet',
      'Flat planes, hairline borders',
      'Glow apenas em métricas ao vivo (gold/orange)',
    ],
  },
};

export type KnowledgeCategory = keyof typeof IRONS_KNOWLEDGE;
