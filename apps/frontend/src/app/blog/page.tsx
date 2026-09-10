'use client';

import { FaBookOpen, FaCalendar, FaArrowRight } from 'react-icons/fa';
import { ChatWidget } from '@/components/ChatWidget';

type BlogPost = {
  id: number;
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  summary: string;
  gradient: string;
};

const POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'Guia Completo de Marés de Ilha Comprida',
    category: 'Maré',
    categoryColor: 'bg-blue-500/20 text-blue-400',
    date: '05/09/2026',
    summary: 'Entenda os ciclos de maré alta e baixa na costa paulista. Melhores horários para pesca, surf e coleta de mariscos na região.',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 2,
    title: 'Ventos de Sudeste: O Que Esperar no Inverno',
    category: 'Clima',
    categoryColor: 'bg-amber-500/20 text-amber-400',
    date: '01/09/2026',
    summary: 'Análise dos padrões de vento dominantes no litoral sul durante o período de inverno. Impacto nas condições de surf e navegação.',
    gradient: 'from-amber-600 to-orange-600',
  },
  {
    id: 3,
    title: 'Dinâmica Costeira do Vale do Ribeira',
    category: 'Oceanografia',
    categoryColor: 'bg-emerald-500/20 text-emerald-400',
    date: '28/08/2026',
    summary: 'Como as correntes marítimas e o sedimento do Rio Ribeira formam e transformam as praias da região ao longo dos anos.',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    id: 4,
    title: 'Proteção Ambiental: A Reserva de Cananéia',
    category: 'Meio Ambiente',
    categoryColor: 'bg-green-500/20 text-green-400',
    date: '25/08/2026',
    summary: 'Importância ecológica da Baía de Cananéia e das manguezais. Como contribuir para a preservação deste ecossistema único.',
    gradient: 'from-green-600 to-emerald-600',
  },
];

export default function BlogPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <FaBookOpen className="w-8 h-8 text-blue-500" />
          Blog Técnico
        </h2>
        <p className="text-slate-400 text-sm mt-1">Artigos e guias especiais sobre o clima e litoral do Vale do Ribeira</p>
      </div>

      {/* Grid de Artigos */}
      <div className="grid sm:grid-cols-2 gap-6">
        {POSTS.map(post => (
          <article
            key={post.id}
            className="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
          >
            {/* Imagem/Capa placeholder */}
            <div className={`h-40 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
              <FaBookOpen className="w-12 h-12 text-white/30" />
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${post.categoryColor}`}>
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <FaCalendar className="w-3 h-3" />
                  {post.date}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {post.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {post.summary}
              </p>

              <div className="flex items-center gap-1 text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
                <span>Ler artigo completo</span>
                <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </article>
        ))}
      </div>

      <ChatWidget />
    </div>
  );
}
