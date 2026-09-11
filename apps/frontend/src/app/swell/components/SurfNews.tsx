'use client';

import { FaExternalLinkAlt, FaNewspaper } from 'react-icons/fa';

type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  description: string;
  image: string;
  category: string;
};

const NEWS: NewsItem[] = [
  {
    id: 'wsl-championship',
    title: 'WSL Championship Tour 2026 — Etapa do Havaí',
    source: 'World Surf League',
    url: 'https://www.worldsurfleague.com',
    description: 'Acompanhe o Campeonato Mundial de Surf ao vivo — melhores ondas,.classificações e highlights.',
    image: 'https://images.unsplash.com/photo-1502680390548-bdbac40a9d2f?w=400&h=250&fit=crop',
    category: 'WSL',
  },
  {
    id: 'wsl-ranking',
    title: 'Ranking WSL — Quem lidera o Ranking Geral?',
    source: 'World Surf League',
    url: 'https://www.worldsurfleague.com/athletes/tour/mct',
    description: 'Confira a classificação atual do Championship Tour e quem está na zona de rebaixamento.',
    image: 'https://images.unsplash.com/photo-1455729552457-5c322b382024?w=400&h=250&fit=crop',
    category: 'WSL',
  },
  {
    id: 'spsurf-competicao',
    title: 'SPSurf — Circuito Paulista de Surf 2026',
    source: 'spsurf.com.br',
    url: 'https://www.spsurf.com.br',
    description: 'Próxima etapa do Circuito Paulista será em Ilha Comprida. Inscrições abertas para todas as categorias.',
    image: 'https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=400&h=250&fit=crop',
    category: 'Paulista',
  },
  {
    id: 'spsurf-ranking',
    title: 'SPSurf — Ranking do Litoral Sul',
    source: 'spsurf.com.br',
    url: 'https://www.spsurf.com.br/ranking',
    description: 'Classificação dos surfistas do litoral paulista. Acompanhe seus favoritos.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop',
    category: 'Paulista',
  },
  {
    id: 'cptec-previsao',
    title: 'CPTEC/INPE — Previsão Costeira SP',
    source: 'CPTEC/INPE',
    url: 'https://www.cptec.inpe.br',
    description: 'Previsão numérica para o litoral de São Paulo — ventos, ondas e temperatura do mar para os próximos 7 dias.',
    image: 'https://images.unsplash.com/photo-1527482937786-6c94007b1c4c?w=400&h=250&fit=crop',
    category: 'Previsão',
  },
  {
    id: 'cptec-ondas',
    title: 'CPTEC — Modelo de Ondas para o Atlântico Sul',
    source: 'CPTEC/INPE',
    url: 'https://www.cptec.inpe.br/ondas',
    description: 'Modelo numérico de ondas do Atlântico Sul com previsão de swell para o litoral paulista.',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=250&fit=crop',
    category: 'Previsão',
  },
  {
    id: 'defesa-civil',
    title: 'Defesa Civil SP — Alertas de Mar Agitado',
    source: 'Defesa Civil de SP',
    url: 'https://www.defesacivil.sp.gov.br',
    description: 'Alertas oficiais de mar agitado, costões e praias do litoral paulista. Verifique antes de ir à praia.',
    image: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=400&h=250&fit=crop',
    category: 'Alertas',
  },
  {
    id: 'isa-surfing',
    title: 'ISA — Campeonato Mundial de Surf Flow',
    source: 'International Surfing Association',
    url: 'https://www.surfing.org',
    description: 'International Surfing Association anuncia novas vagas para Jogos Olímpicos de 2028.',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=250&fit=crop',
    category: 'ISA',
  },
  {
    id: 'flagra-magazine',
    title: 'Flagra Magazine — Melhores Spots do Litoral Sul',
    source: 'Flagra Surf Magazine',
    url: 'https://www.instagram.com/flagrasurf',
    description: 'Guia completo dos melhores picos do litoral sul de São Paulo para todos os níveis.',
    image: 'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=400&h=250&fit=crop',
    category: 'Magazine',
  },
  {
    id: 'surfer-today',
    title: 'Surfer Today — Condições do Atlântico Sul',
    source: 'Surfer Today',
    url: 'https://www.surfertoday.com',
    description: 'Análise das condições de surf no Atlântico Sul com previsão para a semana.',
    image: 'https://images.unsplash.com/photo-1504681869696-d977211a5f4c?w=400&h=250&fit=crop',
    category: 'Global',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  WSL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Paulista: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Previsão: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Alertas: 'bg-red-500/20 text-red-400 border-red-500/30',
  ISA: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Magazine: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Global: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function SurfNews() {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Notícias de surf">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
        <FaNewspaper className="w-4 h-4 text-blue-400" aria-hidden="true" />
        Notícias de Surf
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
        {NEWS.map(item => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${item.title} — ${item.source} (abrir em nova aba)`}
            aria-label={`${item.title}, fonte: ${item.source}`}
            role="listitem"
            className="group rounded-xl overflow-hidden bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:border-blue-500/30 transition-all"
          >
            <div className="h-40 bg-slate-800 overflow-hidden relative">
              <img
                src={item.image}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-medium border ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Global}`}>
                {item.category}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">{item.title}</h4>
                <FaExternalLinkAlt className="w-3 h-3 text-slate-500 group-hover:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
              </div>
              <p className="text-[10px] text-blue-400 font-medium mb-1">{item.source}</p>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
