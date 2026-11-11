'use client';

import { FaInfoCircle, FaExternalLinkAlt, FaCloud, FaWater, FaShieldAlt, FaCode, FaDatabase, FaGlobe } from 'react-icons/fa';
import { PageBanner } from '@/components/PageBanner';
import { useDict } from '@/i18n/context';
import { creditos } from '@/i18n/dictionaries/creditos';
import { fmt } from '@/i18n/format';

const DATA_SOURCES = [
  {
    name: 'Open-Meteo',
    descKey: 'source.openMeteo.desc',
    url: 'https://open-meteo.com',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaCloud,
  },
  {
    name: 'Open-Meteo Marine',
    descKey: 'source.openMeteoMarine.desc',
    url: 'https://open-meteo.com/en/docs/marine-api',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaWater,
  },
  {
    name: 'Google Gemini',
    descKey: 'source.gemini.desc',
    url: 'https://ai.google.dev',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaDatabase,
  },
  {
    name: 'RainViewer',
    descKey: 'source.rainviewer.desc',
    url: 'https://www.rainviewer.com',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaCloud,
  },
  {
    name: 'OpenStreetMap',
    descKey: 'source.osm.desc',
    url: 'https://www.openstreetmap.org',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaGlobe,
  },
  {
    name: 'OSRM',
    descKey: 'source.osrm.desc',
    url: 'http://project-osrm.org',
    status: 'source.status',
    statusColor: 'bg-emerald-500/20 text-emerald-400',
    icon: FaGlobe,
  },
];

const TECH_STACK = [
  { name: 'Next.js 15', roleKey: 'stack.nextjs.role', icon: FaCode },
  { name: 'React 19', roleKey: 'stack.react.role', icon: FaCode },
  { name: 'NestJS', roleKey: 'stack.nestjs.role', icon: FaCode },
  { name: 'Tailwind CSS v4', roleKey: 'stack.tailwind.role', icon: FaCode },
  { name: 'Leaflet', roleKey: 'stack.leaflet.role', icon: FaGlobe },
  { name: 'ApexCharts', roleKey: 'stack.apexcharts.role', icon: FaCode },
  { name: 'React Icons', roleKey: 'stack.reacticons.role', icon: FaCode },
  { name: 'TypeScript', roleKey: 'stack.typescript.role', icon: FaCode },
  { name: 'Google Gemini', roleKey: 'stack.gemini.role', icon: FaDatabase },
  { name: 'Drizzle ORM', roleKey: 'stack.drizzle.role', icon: FaDatabase },
  { name: 'Zod', roleKey: 'stack.zod.role', icon: FaCode },
  { name: 'Vitest', roleKey: 'stack.vitest.role', icon: FaCode },
  { name: 'Jest', roleKey: 'stack.jest.role', icon: FaCode },
  { name: 'pnpm', roleKey: 'stack.pnpm.role', icon: FaDatabase },
];

const LICENSES = [
  { name: 'MIT License', usageKey: 'license.mit.usage' },
  { name: 'Open-Meteo API', usageKey: 'license.openMeteo.usage' },
  { name: 'OpenStreetMap', usageKey: 'license.osm.usage' },
  { name: 'Leaflet', usageKey: 'license.leaflet.usage' },
  { name: 'ApexCharts', usageKey: 'license.apexcharts.usage' },
  { name: 'React Icons', usageKey: 'license.reacticons.usage' },
  { name: 'Google Gemini', usageKey: 'license.gemini.usage' },
  { name: 'RainViewer', usageKey: 'license.rainviewer.usage' },
  { name: 'OSRM', usageKey: 'license.osrm.usage' },
  { name: 'Drizzle ORM', usageKey: 'license.drizzle.usage' },
  { name: 'Zod', usageKey: 'license.zod.usage' },
  { name: 'Next.js', usageKey: 'license.nextjs.usage' },
  { name: 'NestJS', usageKey: 'license.nestjs.usage' },
  { name: 'Tailwind CSS', usageKey: 'license.tailwind.usage' },
];

export default function CreditosPage() {
  const t = useDict(creditos);

  return (
    <div className="space-y-8">
      <PageBanner title={t['page.title']} subtitle={t['page.subtitle']} />

      <div>
        <h2 className="text-3xl font-extrabold text-card-text flex items-center gap-3">
          <FaInfoCircle className="w-8 h-8 text-blue-500" aria-hidden="true" />
          {t['section.intro.title']}
        </h2>
        <p className="text-card-muted text-sm mt-1">{t['section.intro.desc']}</p>
      </div>

      {/* Fontes de Dados */}
      <section aria-label={t['section.sources.title']}>
        <h3 className="text-lg font-bold text-card-text mb-4 flex items-center gap-2">
          <FaDatabase className="w-5 h-5 text-blue-400" aria-hidden="true" />
          {t['section.sources.title']}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATA_SOURCES.map(source => {
            const Icon = source.icon;
            const description = t[source.descKey];
            return (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                title={fmt(t['a11y.openSource'], { name: source.name })}
                aria-label={fmt(t['a11y.openSourceDesc'], { name: source.name, description })}
                className="group p-5 bg-card/80 hover:bg-card border border-card-border hover:border-blue-500/50 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-card-2 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${source.statusColor}`}>
                      {t[source.status]}
                    </span>
                    <FaExternalLinkAlt className="w-3.5 h-3.5 text-card-faint group-hover:text-blue-400 transition-colors" aria-hidden="true" />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-card-text mb-1">{source.name}</h4>
                <p className="text-[11px] text-card-muted leading-relaxed">{description}</p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Stack Tecnológica */}
      <section aria-label={t['section.stack.title']}>
        <h3 className="text-lg font-bold text-card-text mb-4 flex items-center gap-2">
          <FaCode className="w-5 h-5 text-blue-400" aria-hidden="true" />
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
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-bold text-card-text">{tech.name}</span>
                </div>
                <p className="text-[11px] text-card-dim">{t[tech.roleKey]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Licenças */}
      <section aria-label={t['section.licenses.title']}>
        <h3 className="text-lg font-bold text-card-text mb-4 flex items-center gap-2">
          <FaShieldAlt className="w-5 h-5 text-blue-400" aria-hidden="true" />
          {t['section.licenses.title']}
        </h3>
        <div className="bg-card border border-card-border rounded-2xl p-5 shadow-lg">
          <div className="space-y-3">
            {LICENSES.map(lic => (
              <div key={lic.name} className="flex items-center justify-between py-2 border-b border-card-border last:border-0">
                <span className="text-sm font-semibold text-card-text">{lic.name}</span>
                <span className="text-[11px] text-card-dim">{t[lic.usageKey]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
