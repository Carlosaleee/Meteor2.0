'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, ShieldAlert, CloudSun, Waves, Car, Newspaper, BookOpen, Info, ArrowRight } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';

const sections = [
  { title: 'Meteorologia', href: '/meteorologia', desc: 'Previsão do tempo, temperaturas e vento nas estações locais.', icon: CloudSun },
  { title: 'Swell & Picos', href: '/swell', desc: 'Telemetria de ondas, marés e picos de surf em Ilha Comprida.', icon: Waves },
  { title: 'Trânsito & Vias', href: '/transito', desc: 'Condições de tráfego na SP-222, BR-116 e balsas regionais.', icon: Car },
  { title: 'Notícias Regionais', href: '/noticias', desc: 'Feed unificado das principais fontes do Vale do Ribeira.', icon: Newspaper },
  { title: 'Blog Técnico', href: '/blog', desc: 'Artigos e guias especiais sobre o clima e litoral.', icon: BookOpen },
  { title: 'Créditos & Fontes', href: '/creditos', desc: 'Transparência de dados e APIs oficiais integradas.', icon: Info },
];

export default function PrincipalPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Alerta / Above the Fold */}
      <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-800/40 rounded-2xl p-4 md:p-6 flex items-start gap-4 shadow-lg">
        <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-amber-200">Alerta Regional Ativo</h2>
          <p className="text-sm text-slate-300 mt-1">
            Defesa Civil emite aviso preventivo para rajadas moderadas de vento na costa de Ilha Comprida e Iguape. Acompanhe os boletins oficiais.
          </p>
        </div>
      </div>

      {/* Briefing Tático IA (Gemini Flash) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Briefing Executivo (IA)</h2>
            <p className="text-xs text-slate-400">Síntese automatizada cruzando clima, mar e trânsito regional</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          Condições oceanográficas favoráveis para prática de surf no Boqueirão Norte com ondas na faixa de 1.2m e período de 10s. Trânsito sem intercorrências nas rodovias de acesso ao Vale do Ribeira (SP-222 e BR-116). Temperatura variando entre 22°C e 28°C com céu parcialmente limpo.
        </p>
      </div>

      {/* Barra de Pesquisa Rápida para Seções */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Navegação Rápida</h2>
            <p className="text-xs text-slate-400">Encontre rapidamente seções e dados na aplicação</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar seção (ex: vento, trânsito)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Grid de Seções */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <Link
                key={idx}
                href={sec.href}
                className="group p-5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-blue-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{sec.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{sec.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Widget de Chatbot Flutuante */}
      <ChatWidget />
    </div>
  );
}
