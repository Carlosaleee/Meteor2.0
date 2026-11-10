'use client';

import { FaInfoCircle, FaExternalLinkAlt, FaCloud, FaWater, FaShieldAlt, FaCode, FaDatabase, FaGlobe } from 'react-icons/fa';
import { PageBanner } from '@/components/PageBanner';
import { useDict } from '@/i18n/context';
import { creditos } from '@/i18n/dictionaries/creditos';
import { fmt } from '@/i18n/format';

const DATA_SOURCES = [
  {
    name: 'Open-Meteo',
    description: 'API gratuita de previsão do tempo e dados marinhos. Sem necessidade de chave de API.',
    url: 'https://open-meteo.com',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaCloud,
  },
  {
    name: 'Open-Meteo Marine',
    description: 'Dados de ondas, swell, vento e marés para toda a costa brasileira.',
    url: 'https://open-meteo.com/en/docs/marine-api',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaWater,
  },
  {
    name: 'Google Gemini',
    description: 'Inteligência artificial para briefings de surf e análise de condições oceânicas.',
    url: 'https://ai.google.dev',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaDatabase,
  },
  {
    name: 'RainViewer',
    description: 'Radar de precipitação em tempo real. Dados de chuva e intensidade.',
    url: 'https://www.rainviewer.com',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaCloud,
  },
  {
    name: 'OpenStreetMap',
    description: 'Dados cartográficos gratuitos para mapas interativos com Leaflet.',
    url: 'https://www.openstreetmap.org',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaGlobe,
  },
  {
    name: 'OSRM',
    description: 'Routing engine para cálculo de rotas e distâncias entre pontos.',
    url: 'http://project-osrm.org',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaGlobe,
  },
];

const TECH_STACK = [
  { name: 'Next.js 15', role: 'Frontend Framework', icon: FaCode },
  { name: 'React 19', role: 'UI Library', icon: FaCode },
  { name: 'NestJS', role: 'Backend API', icon: FaCode },
  { name: 'Tailwind CSS v4', role: 'Estilização', icon: FaCode },
  { name: 'Leaflet', role: 'Mapas Interativos', icon: FaGlobe },
  { name: 'ApexCharts', role: 'Gráficos Interativos', icon: FaCode },
  { name: 'React Icons', role: 'Ícones (Font Awesome)', icon: FaCode },
  { name: 'TypeScript', role: 'Type Safety', icon: FaCode },
  { name: 'Google Gemini', role: 'IA / Briefings', icon: FaDatabase },
  { name: 'Drizzle ORM', role: 'Database ORM', icon: FaDatabase },
  { name: 'Zod', role: 'Validação de Dados', icon: FaCode },
  { name: 'Vitest', role: 'Testes Frontend', icon: FaCode },
  { name: 'Jest', role: 'Testes Backend', icon: FaCode },
  { name: 'pnpm', role: 'Package Manager', icon: FaDatabase },
];

const LICENSES = [
  { name: 'MIT License', usage: 'Projeto Meteor 2.0' },
  { name: 'Open-Meteo API', usage: 'Dados meteorológicos e marinhos (CC BY 4.0)' },
  { name: 'OpenStreetMap', usage: 'Dados cartográficos (ODbL)' },
  { name: 'Leaflet', usage: 'Biblioteca de mapas (BSD-2-Clause)' },
  { name: 'ApexCharts', usage: 'Gráficos interativos (MIT)' },
  { name: 'React Icons', usage: 'Ícones (MIT)' },
  { name: 'Google Gemini', usage: 'API de IA (Apache 2.0)' },
  { name: 'RainViewer', usage: 'Radar de precipitação (CC BY 4.0)' },
  { name: 'OSRM', usage: 'Routing engine (BSD-2-Clause)' },
  { name: 'Drizzle ORM', usage: 'Database ORM (Apache 2.0)' },
  { name: 'Zod', usage: 'Validação de dados (MIT)' },
  { name: 'Next.js', usage: 'Frontend framework (MIT)' },
  { name: 'NestJS', usage: 'Backend framework (MIT)' },
  { name: 'Tailwind CSS', usage: 'Estilização (MIT)' },
];

export default function CreditosPage() {
  const t = useDict(creditos);

  return (
    <div className="space-y-8">
      <PageBanner title={t['page.title']} subtitle={t['page.subtitle']} />

      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <FaInfoCircle className="w-8 h-8 text-blue-500" />
          {t['section.intro.title']}
        </h2>
        <p className="text-card-muted text-sm mt-1">{t['section.intro.desc']}</p>
      </div>

      {/* Fontes de Dados */}
      <section aria-label={t['section.sources.title']}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaDatabase className="w-5 h-5 text-blue-400" />
          {t['section.sources.title']}
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
                title={fmt(t['a11y.openSource'], { name: source.name })}
                aria-label={fmt(t['a11y.openSourceDesc'], { name: source.name, description: source.description })}
                className="group p-5 bg-card/80 hover:bg-card border border-card-border hover:border-blue-500/50 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-card-2 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${source.statusColor}`}>
                      {t[source.status]}
                    </span>
                    <FaExternalLinkAlt className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" aria-hidden="true" />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-card-text mb-1">{source.name}</h4>
                <p className="text-[11px] text-card-muted leading-relaxed">{source.description}</p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Stack Tecnológica */}
      <section aria-label={t['section.stack.title']}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaCode className="w-5 h-5 text-blue-400" />
          {t['section.stack.title']}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TECH_STACK.map(tech => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="p-4 bg-card border border-card-border rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-card-2 text-blue-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-card-text">{tech.name}</span>
                </div>
                <p className="text-[11px] text-slate-500">{tech.role}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Licenças */}
      <section aria-label={t['section.licenses.title']}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaShieldAlt className="w-5 h-5 text-blue-400" />
          {t['section.licenses.title']}
        </h3>
        <div className="bg-card border border-card-border rounded-2xl p-5 shadow-lg">
          <div className="space-y-3">
            {LICENSES.map(lic => (
              <div key={lic.name} className="flex items-center justify-between py-2 border-b border-card-border last:border-0">
                <span className="text-sm font-semibold text-card-text">{lic.name}</span>
                <span className="text-[11px] text-slate-500">{lic.usage}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
