'use client';

import { Info, Code, Database, Sparkles } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';

export default function CreditosPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Info className="w-8 h-8 text-blue-500" />
          Créditos & Fontes Oficiais
        </h2>
        <p className="text-slate-400 text-sm mt-1">Transparência institucional, APIs integradas e stack tecnológica do Meteor 2.0</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Fontes de Dados Oficiais</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
              <span><strong>INMET & Climatempo</strong> — Estações Meteorológicas</span>
              <span className="text-blue-400">Atmosfera</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
              <span><strong>Open-Meteo Marine & Stormglass</strong> — Telemetria Marítima</span>
              <span className="text-blue-400">Ondas & Swell</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
              <span><strong>Prefeituras & Defesa Civil</strong> — Alertas e Avisos</span>
              <span className="text-blue-400">Utilidade Pública</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Stack Tecnológica & IA</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
              <span><strong>Next.js 15 (App Router) & React 19</strong></span>
              <span className="text-purple-400">Frontend</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
              <span><strong>NestJS & TypeScript</strong></span>
              <span className="text-purple-400">Backend API</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
              <span><strong>Google Gemini Flash</strong> — Motor de Briefing IA</span>
              <span className="text-purple-400">Inteligência Artificial</span>
            </li>
          </ul>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
