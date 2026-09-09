'client';

import { BookOpen, Clock, User } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';

const articles = [
  {
    title: 'Guia Técnico: Como interpretar os períodos de Swell no litoral sul de SP',
    author: 'Equipe Meteor 2.0',
    date: '08 de Setembro, 2026',
    readTime: '4 min de leitura',
    excerpt: 'Entenda a diferença entre o swell gerado por tempestades austrais e as ondas locais de vento (wind swell), e como isso afeta os picos de Ilha Comprida.'
  },
  {
    title: 'A Influência do Clima e das Frentes Frias na Dinâmica Costeira do Vale do Ribeira',
    author: 'Dr. Meteorologia Costeira',
    date: '02 de Setembro, 2026',
    readTime: '6 min de leitura',
    excerpt: 'Uma análise detalhada sobre o comportamento atmosférico na região e sua correlação direta com a variação barométrica e ventos terrais.'
  },
  {
    title: 'Segurança no Mar: O que observar antes de encarar o Boqueirão Sul',
    author: 'Especialista em Salvatagem',
    date: '28 de Agosto, 2026',
    readTime: '5 min de leitura',
    excerpt: 'Dicas essenciais sobre correntes de retorno, marés e análise prévia de vento para surfistas e banhistas na região.'
  }
];

export default function BlogPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-500" />
          Blog & Artigos Técnicos
        </h2>
        <p className="text-slate-400 text-sm mt-1">Conteúdo aprofundado sobre meteorologia, oceanografia e o litoral de São Paulo</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((art, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {art.author}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {art.readTime}</span>
              </div>
              <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors cursor-pointer">
                {art.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{art.excerpt}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{art.date}</span>
              <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Ler artigo &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      <ChatWidget />
    </div>
  );
}
