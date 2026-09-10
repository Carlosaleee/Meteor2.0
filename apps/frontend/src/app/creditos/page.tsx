'use client';

import { FaInfoCircle, FaExternalLinkAlt, FaCloud, FaWater, FaShieldAlt, FaCode, FaDatabase, FaGlobe } from 'react-icons/fa';
import { ChatWidget } from '@/components/ChatWidget';

const DATA_SOURCES = [
  {
    name: 'Open-Meteo',
    description: 'API gratuita de previsão do tempo e dados marinhos. Sem necessidade de chave de API.',
    url: 'https://open-meteo.com',
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaCloud,
  },
  {
    name: 'INMET',
    description: 'Instituto Nacional de Meteorologia. Dados oficiais de estações atmosféricas.',
    url: 'https://apitempo.inmet.gov.br',
    status: 'Reserva',
    statusColor: 'bg-amber-500/20 text-amber-400',
    icon: FaShieldAlt,
  },
  {
    name: 'Open-Meteo Marine',
    description: 'Dados de ondas, swell e marés para toda a costa brasileira.',
    url: 'https://open-meteo.com/en/docs/marine-api',
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaWater,
  },
];

const TECH_STACK = [
  { name: 'Next.js 15', role: 'Frontend Framework', icon: FaCode },
  { name: 'React 19', role: 'UI Library', icon: FaCode },
  { name: 'NestJS', role: 'Backend API', icon: FaCode },
  { name: 'Tailwind CSS v4', role: 'Estilização', icon: FaCode },
  { name: 'Leaflet', role: 'Mapas Interativos', icon: FaGlobe },
  { name: 'TypeScript', role: 'Type Safety', icon: FaCode },
  { name: 'Google Gemini', role: 'IA / Briefings', icon: FaDatabase },
  { name: 'pnpm', role: 'Package Manager', icon: FaDatabase },
];

const LICENSES = [
  { name: 'MIT License', usage: 'Projeto Meteor 2.0' },
  { name: 'Open-Meteo API', usage: 'Dados meteorológicos e marinhos (CC BY 4.0)' },
  { name: 'OpenStreetMap', usage: 'Dados cartográficos (ODbL)' },
  { name: 'Leaflet', usage: 'Biblioteca de mapas (BSD-2-Clause)' },
  { name: 'Next.js', usage: 'Framework frontend (MIT)' },
  { name: 'NestJS', usage: 'Backend Framework (MIT)' },
];

export default function CreditosPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <FaInfoCircle className="w-8 h-8 text-blue-500" />
          Créditos & Fontes Oficiais
        </h2>
        <p className="text-slate-400 text-sm mt-1">Transparência de dados e stack tecnológica utilizada</p>
      </div>

      {/* Fontes de Dados */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaDatabase className="w-5 h-5 text-blue-400" />
          Fontes de Dados
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATA_SOURCES.map(source => {
            const Icon = source.icon;
            return (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${source.statusColor}`}>
                      {source.status}
                    </span>
                    <FaExternalLinkAlt className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{source.name}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{source.description}</p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Stack Tecnológica */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaCode className="w-5 h-5 text-blue-400" />
          Stack Tecnológica
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TECH_STACK.map(tech => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-slate-800 text-blue-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">{tech.name}</span>
                </div>
                <p className="text-[11px] text-slate-500">{tech.role}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Licenças */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaShieldAlt className="w-5 h-5 text-blue-400" />
          Licenças
        </h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="space-y-3">
            {LICENSES.map(lic => (
              <div key={lic.name} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <span className="text-sm font-semibold text-white">{lic.name}</span>
                <span className="text-[11px] text-slate-500">{lic.usage}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
}
