'use client';

import { useState } from 'react';
import { FaNewspaper, FaExternalLinkAlt, FaFilter } from 'react-icons/fa';
import { ChatWidget } from '@/components/ChatWidget';
import { PageBanner } from '@/components/PageBanner';

type NewsItem = {
  id: number;
  source: string;
  sourceColor: string;
  title: string;
  summary: string;
  date: string;
  url: string;
};

const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    source: 'G1 Santos',
    sourceColor: 'bg-green-500/20 text-green-400',
    title: 'Defesa Civil emite alerta preventivo para rajadas de vento na costa',
    summary: 'Alerta vale para litoral sul de SP, incluindo Ilha Comprida e Iguape. Moradores de áreas costeiras devem redobrar atenção.',
    date: '08/09/2026',
    url: 'https://g1.globo.com/sp/santos-regiao/',
  },
  {
    id: 2,
    source: 'Portal da Cidade',
    sourceColor: 'bg-blue-500/20 text-blue-400',
    title: 'Balsa Cananéia opera com fila de 20 minutos neste sábado',
    summary: 'Travessia entre Cananéia e Ilha Comprida registra movimento intenso de veículos no início do feriado prolongado.',
    date: '08/09/2026',
    url: 'https://www.portaldacidade.com',
  },
  {
    id: 3,
    source: 'Diário do Ribeira',
    sourceColor: 'bg-amber-500/20 text-amber-400',
    title: 'Obras de pavimentação na SP-222 avançam no trecho Iguape-Cananéia',
    summary: 'Concessão da Via Sul prevê conclusão do asfaltamento até dezembro. Rodovia terá sinalização inteligente.',
    date: '07/09/2026',
    url: 'https://www.diariodribeira.com.br',
  },
  {
    id: 4,
    source: 'Defesa Civil',
    sourceColor: 'bg-red-500/20 text-red-400',
    title: 'Boletim preventivo: maré alta pode atingir áreas baixas de Ilha Comprida',
    summary: 'Previsão de maré de sizigia nas próximas 48h. Moradores de vicinais baixas devem tomar precauções.',
    date: '07/09/2026',
    url: '#',
  },
  {
    id: 5,
    source: 'G1 Santos',
    sourceColor: 'bg-green-500/20 text-green-400',
    title: 'Turismo em alta: Ilha Comprida recebe recorde de visitantes no feriado',
    summary: 'Praias da ilha registram fluxo 40% superior ao esperado. Hotéis e campings atingiram 95% de ocupação.',
    date: '06/09/2026',
    url: 'https://g1.globo.com/sp/santos-regiao/',
  },
  {
    id: 6,
    source: 'Rádio Eldorado',
    sourceColor: 'bg-purple-500/20 text-purple-400',
    title: 'BR-116: Caminhões formam fila de 3km na serra do Regis Bittencourt',
    summary: 'Tráfego de veículos pesados retorna ao normal apenas após as 20h. Motoristas devem evitar o trecho no horário de pico.',
    date: '06/09/2026',
    url: '#',
  },
  {
    id: 7,
    source: 'Prefeitura de Cananéia',
    sourceColor: 'bg-teal-500/20 text-teal-400',
    title: 'Novo posto de saúde será inaugurado no bairro do Castelo',
    summary: 'Unidade vai atender demanda da população ribeirinha. Investimento de R$ 2,3 milhões pela administração municipal.',
    date: '05/09/2026',
    url: '#',
  },
  {
    id: 8,
    source: 'Portal da Cidade',
    sourceColor: 'bg-blue-500/20 text-blue-400',
    title: 'Pescadores artesanais denunciam pesca ilegal na Baía de Cananéia',
    summary: 'Comunidade de-caça-renda pede intervenção da IBAMA. Área é reserva de proteção ambiental.',
    date: '05/09/2026',
    url: 'https://www.portaldacidade.com',
  },
];

const SOURCES = [...new Set(NEWS_DATA.map(n => n.source))];

export default function NoticiasPage() {
  const [activeFilter, setActiveFilter] = useState<string>('Todos');

  const filtered = activeFilter === 'Todos'
    ? NEWS_DATA
    : NEWS_DATA.filter(n => n.source === activeFilter);

  return (
    <div className="space-y-8">
      <PageBanner title="Notícias Regionais" subtitle="Feed unificado das principais fontes do Vale do Ribeira" />

      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <FaNewspaper className="w-8 h-8 text-blue-500" />
          Notícias Regionais
        </h2>
        <p className="text-slate-400 text-sm mt-1">Feed unificado das principais fontes do Vale do Ribeira</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <FaFilter className="w-4 h-4 text-slate-500 mr-1" />
        <button
          onClick={() => setActiveFilter('Todos')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeFilter === 'Todos'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          Todos
        </button>
        {SOURCES.map(source => (
          <button
            key={source}
            onClick={() => setActiveFilter(source)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeFilter === source
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {source}
          </button>
        ))}
      </div>

      {/* Grid de Notícias */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <a
            key={item.id}
            href={item.url}
            target={item.url !== '#' ? '_blank' : undefined}
            rel={item.url !== '#' ? 'noopener noreferrer' : undefined}
            className="group p-5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-blue-500/10"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.sourceColor}`}>
                  {item.source}
                </span>
                <span className="text-[10px] text-slate-600">{item.date}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {item.summary}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[10px] text-slate-500 group-hover:text-blue-400 transition-colors">
              <span>Ler mais</span>
              <FaExternalLinkAlt className="w-3 h-3" />
            </div>
          </a>
        ))}
      </div>

      <ChatWidget />
    </div>
  );
}
