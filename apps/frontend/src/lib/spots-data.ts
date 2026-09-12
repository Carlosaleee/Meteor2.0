export type Spot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  bestWind: string;
  exposure: string;
  description: string;
  municipality: string;
  googleMapsUrl: string;
};

export const SPOTS: Spot[] = [
  {
    id: 'jureia',
    name: 'Praia da Juréia',
    lat: -24.5300,
    lon: -47.3100,
    level: 'advanced',
    bestWind: 'Oeste (Terral)',
    exposure: 'Leste — mar aberto',
    description: 'Região norte da ilha, transição com a Juréia (Iguape). Ondas fortes e mar aberto, recomendada para surfistas experientes.',
    municipality: 'Ilha Comprida',
    googleMapsUrl: 'https://maps.google.com/?cid=14499485567402980024',
  },
  {
    id: 'ponta-norte',
    name: 'Ponta da Praia Norte',
    lat: -24.6800,
    lon: -47.5200,
    level: 'intermediate',
    bestWind: 'Noroeste (Terral)',
    exposure: 'Norte/Nordeste',
    description: 'Setor norte da orla de Ilha Comprida. Condições variáveis com ondas medianas, ideal para intermediários.',
    municipality: 'Ilha Comprida',
    googleMapsUrl: 'https://maps.google.com/?cid=7717433383317665554',
  },
  {
    id: 'balneario-adriana',
    name: 'Balneário Adriana',
    lat: -24.7000,
    lon: -47.5200,
    level: 'beginner',
    bestWind: 'Oeste (Terral)',
    exposure: 'Leste',
    description: 'Setor norte-intermediário, próximo ao eixo de infraestrutura central. Ondas suaves, ideal para iniciantes.',
    municipality: 'Ilha Comprida',
    googleMapsUrl: 'https://maps.google.com/?cid=45535704248816933',
  },
  {
    id: 'boqueirao-norte',
    name: 'Boqueirão Norte',
    lat: -24.7167,
    lon: -47.5333,
    level: 'beginner',
    bestWind: 'Oeste (Terral)',
    exposure: 'Leste — protegido',
    description: 'Principal centro urbano e acesso principal da cidade. Ondas suaves e accesso fácil, ponto de referência da ilha.',
    municipality: 'Ilha Comprida',
    googleMapsUrl: 'https://maps.google.com/?cid=8583435902239314083',
  },
  {
    id: 'balneario-araca',
    name: 'Balneário Araçá',
    lat: -24.7200,
    lon: -47.5400,
    level: 'intermediate',
    bestWind: 'Noroeste (Terral)',
    exposure: 'Leste/Sudeste',
    description: 'Região intermediária conhecida pelas formações de dunas e restinga preservada. Ondas medianas com variações sazonais.',
    municipality: 'Ilha Comprida',
    googleMapsUrl: 'https://maps.google.com/?q=-24.7200,-47.5400',
  },
  {
    id: 'parada-do-surf',
    name: 'Parada do Surf',
    lat: -24.7400,
    lon: -47.5600,
    level: 'beginner',
    bestWind: 'Oeste (Terral)',
    exposure: 'Leste',
    description: 'Localizado na altura do Aragarças (Av. Beira Mar). Ponto de apoio para surfistas com lanchonete e escola de surf.',
    municipality: 'Ilha Comprida',
    googleMapsUrl: 'https://maps.google.com/?cid=8144509812224464901',
  },
  {
    id: 'vialeggio',
    name: 'Orla de Viareggio',
    lat: -24.7800,
    lon: -47.6000,
    level: 'intermediate',
    bestWind: 'Sudoeste (Terral)',
    exposure: 'Leste/Nordeste',
    description: 'Balneário Viareggio, ponto intermediário na orla da ilha. Condições variáveis com boas oportunidades para intermediários.',
    municipality: 'Ilha Comprida',
    googleMapsUrl: 'https://maps.google.com/?cid=17418829979133649548',
  },
  {
    id: 'dunas-juruvauva',
    name: 'Dunas de Juruvaúva',
    lat: -24.8200,
    lon: -47.6800,
    level: 'advanced',
    bestWind: 'Oeste/Noroeste (Terral)',
    exposure: 'Sudeste — mar aberto',
    description: 'Setor sul da ilha, abrigo das maiores dunas do município e desembocadura do Rio Cordeirinho. Ondas fortes e isolamento.',
    municipality: 'Ilha Comprida',
    googleMapsUrl: 'https://maps.google.com/?q=-24.8200,-47.6800',
  },
  {
    id: 'pedrinhas',
    name: 'Pedrinhas',
    lat: -24.8500,
    lon: -47.6500,
    level: 'intermediate',
    bestWind: 'Sudoeste (Terral)',
    exposure: 'Sudeste',
    description: 'Vila de pescadores tradicional e polo turístico localizado no setor sul/intermediário da ilha. Ondas moderadas.',
    municipality: 'Ilha Comprida',
    googleMapsUrl: 'https://maps.google.com/?cid=17493148845570623580',
  },
  {
    id: 'boqueirao-sul',
    name: 'Boqueirão Sul',
    lat: -24.9500,
    lon: -47.7500,
    level: 'advanced',
    bestWind: 'Oeste (Terral)',
    exposure: 'Sul/Sudeste — mar aberto',
    description: 'Extremidade sul de Ilha Comprida, próximo à divisa fluvial/balsa com Cananéia. Ondas fortes e条件ções desafiadoras.',
    municipality: 'Ilha Comprida',
    googleMapsUrl: 'https://maps.google.com/?cid=14701931616348814587',
  },
];

export const LEVEL_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  beginner: {
    label: 'Iniciante',
    emoji: '🌱',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  intermediate: {
    label: 'Intermediário',
    emoji: '🏄',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  advanced: {
    label: 'Avançado',
    emoji: '🔥',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
};
