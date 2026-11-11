'use client';

import { FaDatabase, FaCode, FaExternalLinkAlt, FaGithub, FaMap, FaPhone, FaWater } from 'react-icons/fa';
import { useDict } from '@/i18n/context';
import { common } from '@/i18n/dictionaries/common';

const DATA_SOURCES = [
  { name: 'Open-Meteo', url: 'https://open-meteo.com' },
  { name: 'INMET', url: 'https://apitempo.inmet.gov.br' },
  { name: 'RainViewer', url: 'https://www.rainviewer.com' },
  { name: 'CPTEC/INPE', url: 'https://www.cptec.inpe.br' },
  { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org' },
];

const TECH_STACK = [
  { name: 'Next.js 15', url: 'https://nextjs.org' },
  { name: 'NestJS', url: 'https://nestjs.com' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  { name: 'Leaflet', url: 'https://leafletjs.com' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
];

const PAGES = [
  { key: 'previsao', href: '/meteorologia' },
  { key: 'swell', href: '/swell' },
  { key: 'noticias', href: '/noticias' },
  { key: 'comercio', href: '/comercio' },
  { key: 'blog', href: '/blog' },
  { key: 'creditos', href: '/creditos' },
];

const EMERGENCY_CONTACTS = [
  { key: 'policiaCivil', phone: '190', icon: '🚔' },
  { key: 'bombeiros', phone: '193', icon: '🚒' },
  { key: 'samu', phone: '192', icon: '🚑' },
  { key: 'defesaCivil', phone: '199', icon: '🛡️' },
  { key: 'policiaMilitar', phone: '197', icon: '👮' },
  { key: 'hospital', phone: '(13) 3851-1515', icon: '🏥' },
];

export function Footer() {
  const year = new Date().getFullYear();
  const t = useDict(common);

  return (
    <footer className="w-full bg-[var(--color-footer-bg)] mt-auto transition-colors duration-300" role="contentinfo">
      {/* Gold Line */}
      <div className="h-px w-full bg-[var(--color-gold-line)]" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Row 1 — Project Description (centered, gold) */}
        <div className="text-center mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--color-gold)] tracking-wide uppercase flex items-center justify-center gap-3">
            <FaWater className="w-6 h-6" aria-hidden="true" />
            {t['footer.brand']}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-footer-text)] max-w-2xl mx-auto leading-relaxed">
            {t['footer.description']}
          </p>
          <p className="mt-2 text-xs text-[var(--color-footer-text)]">
            &copy; {year} {t['footer.license']}
          </p>
        </div>

        {/* Row 2 — 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Navegação */}
          <div className="text-center">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <FaMap className="w-3 h-3" aria-hidden="true" />
              {t['footer.nav.title']}
            </h3>
            <ul className="space-y-2" role="list">
              {PAGES.map(page => (
                <li key={page.href}>
                  <a
                    href={page.href}
                    title={t[`footer.pages.${page.key}`]}
                    className="text-xs text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                  >
                    {t[`footer.pages.${page.key}`]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Fontes de Dados */}
          <div className="text-center">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <FaDatabase className="w-3 h-3" aria-hidden="true" />
              {t['footer.sources.title']}
            </h3>
            <ul className="space-y-2" role="list">
              {DATA_SOURCES.map(source => (
                <li key={source.name}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-xs text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                    aria-label={`${source.name} ${t['footer.newWindow']}`}
                  >
                    <FaExternalLinkAlt className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Stack Tecnológica */}
          <div className="text-center">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <FaCode className="w-3 h-3" aria-hidden="true" />
              {t['footer.stack.title']}
            </h3>
            <ul className="space-y-2" role="list">
              {TECH_STACK.map(tech => (
                <li key={tech.name}>
                  <a
                    href={tech.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-xs text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                    aria-label={`${tech.name} ${t['footer.newWindow']}`}
                  >
                    <FaExternalLinkAlt className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    {tech.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Links Úteis — Emergência */}
          <div className="text-center">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <FaPhone className="w-3 h-3" aria-hidden="true" />
              {t['footer.links.title']}
            </h3>
            <ul className="space-y-2" role="list">
              {EMERGENCY_CONTACTS.map(contact => (
                <li key={contact.key}>
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, '')}`}
                    className="group inline-flex items-center gap-2 text-xs text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                    aria-label={`${t[`footer.contact.${contact.key}`]}: ${contact.phone}`}
                  >
                    <span className="text-sm" aria-hidden="true">{contact.icon}</span>
                    <span className="flex-1 text-left">{t[`footer.contact.${contact.key}`]}</span>
                    <span className="font-mono text-[10px] text-[var(--color-muted)] group-hover:text-[var(--color-gold)]">{contact.phone}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--color-footer-border)] pt-6 flex flex-col items-center gap-3">
          <p className="text-xs text-[var(--color-footer-text)]">
            <span className="text-[var(--color-gold)] font-semibold">Meteor</span> — {t['footer.credits.label']}{' '}
            <a
              href="https://github.com/Carlosaleee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded inline-flex items-center gap-1"
              aria-label={t['footer.github.ariaLabel']}
            >
              Carlos Alexandre
              <FaGithub className="w-3 h-3" aria-hidden="true" />
            </a>
          </p>
          <p className="text-[10px] text-[var(--color-footer-text)]">
            {t['footer.data.line']}
          </p>
        </div>
      </div>
    </footer>
  );
}
