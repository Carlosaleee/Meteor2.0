'use client';

import { Newspaper, ShieldAlert, Radio, Building2, ExternalLink } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';

const newsItems = [
  {
    title: 'Defesa Civil emite alerta para ressaca marítima e ventos costeiros na região',
    source: 'Prefeituras Oficiais / Defesa Civil',
    category: 'Alerta Preventivo',
    time: 'Há 2 horas',
    desc: 'Boletim conjunto orienta pescadores e banhistas a evitarem áreas rochosas e o calçadão durante os picos de maré alta.',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  {
    title: 'Obras de pavimentação e melhorias na SP-222 entram na fase final',
    source: 'Diário do Ribeira',
    category: 'Infraestrutura',
    time: 'Há 5 horas',
    desc: 'Governo estadual vistoria trechos recapeados que ligam Iguape a Cananéia, garantindo mais segurança para o escoamento regional.',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  {
    title: 'Temporada de verão atrai turistas e movimenta comércio em Ilha Comprida',
    source: 'Portal da Cidade Registro',
    category: 'Turismo & Economia',
    time: 'Há 1 dia',
    desc: 'Ocupação hoteleira registra alta significativa nos finais de semana, impulsionando o setor de serviços e gastronomia local.',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    title: 'Rádio Eldorado transmite boletins horários sobre o fluxo na Rodovia Régis Bittencourt',
    source: 'Rádios Regionais',
    category: 'Utilidade Pública',
    time: 'Há 1 dia',
    desc: 'Motoristas que trafegam pelo Vale do Ribeira contam com atualizações em tempo real sobre pontos de retenção na BR-116.',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  {
    title: 'G1 Santos destaca potencial turístico e ecológico das trilhas do Vale do Ribeira',
    source: 'G1 Santos e Região',
    category: 'Regional',
    time: 'Há 2 dias',
    desc: 'Reportagem especial aborda a preservação ambiental e as opções de ecoturismo nos municípios de Registro, Iguape e Cananéia.',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  }
];

export default function NoticiasPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-blue-500" />
          Notícias & Alertas do Vale do Ribeira
        </h2>
        <p className="text-slate-400 text-sm mt-1">Agregação das principais fontes oficiais, prefeituras e portais da região</p>
      </div>

      {/* Grid de Notícias */}
      <div className="grid gap-4">
        {newsItems.map((item, index) => (
          <div key={index} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.badgeColor}`}>
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">{item.source}</span>
                <span className="text-xs text-slate-500">• {item.time}</span>
              </div>
              <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors cursor-pointer">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <ChatWidget />
    </div>
  );
}
