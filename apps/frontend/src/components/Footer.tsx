import { FaDatabase, FaCode, FaExternalLinkAlt, FaGithub, FaUser, FaMap, FaBookOpen } from 'react-icons/fa';

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
  { name: 'Meteorologia', href: '/meteorologia' },
  { name: 'Swell & Picos', href: '/swell' },
  { name: 'Trânsito & Vias', href: '/transito' },
  { name: 'Notícias Regionais', href: '/noticias' },
  { name: 'Blog Técnico', href: '/blog' },
  { name: 'Mapa', href: '/mapa' },
  { name: 'Créditos & Fontes', href: '/creditos' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--color-footer-bg)] mt-auto transition-colors duration-300" role="contentinfo">
      {/* Gold Line — Thin */}
      <div className="h-px w-full bg-[var(--color-gold-line)]" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Row 1 — Project Description (centered, gold) */}
        <div className="text-center mb-8">
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-gold)] tracking-wide uppercase">
            Meteor 2.0
          </h2>
          <p className="mt-2 text-sm text-[var(--color-footer-text)] max-w-2xl mx-auto leading-relaxed">
            Dashboard tático de telemetria meteorológica, oceanográfica e de trânsito para Ilha Comprida e Vale do Ribeira.
            Dados em tempo real integrados de fontes oficiais.
          </p>
          <p className="mt-2 text-xs text-[var(--color-footer-text)]">
            &copy; {year} Meteor 2.0 — Licenciado sob MIT License
          </p>
        </div>

        {/* Row 2 — 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Fontes de Dados */}
          <div className="text-center sm:text-left">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-3 flex items-center justify-center sm:justify-start gap-2">
              <FaDatabase className="w-3 h-3" aria-hidden="true" />
              Fontes de Dados
            </h3>
            <ul className="space-y-1.5" role="list">
              {DATA_SOURCES.map(source => (
                <li key={source.name}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-xs text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                    aria-label={`${source.name} (abre em nova janela)`}
                  >
                    <FaExternalLinkAlt className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Stack Tecnológica */}
          <div className="text-center sm:text-left">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-3 flex items-center justify-center sm:justify-start gap-2">
              <FaCode className="w-3 h-3" aria-hidden="true" />
              Stack Tecnológica
            </h3>
            <ul className="space-y-1.5" role="list">
              {TECH_STACK.map(tech => (
                <li key={tech.name}>
                  <a
                    href={tech.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-xs text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                    aria-label={`${tech.name} (abre em nova janela)`}
                  >
                    <FaExternalLinkAlt className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    {tech.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Créditos */}
          <div className="text-center sm:text-left">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-3 flex items-center justify-center sm:justify-start gap-2">
              <FaUser className="w-3 h-3" aria-hidden="true" />
              Créditos
            </h3>
            <div className="space-y-2">
              <p className="text-xs text-[var(--color-footer-text)]">
                <span className="text-[var(--color-footer-heading)] font-semibold">Carlos Alexandre</span>
                <br />
                Full Stack Developer
              </p>
              <a
                href="https://github.com/Carlosaleee"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-xs text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                aria-label="GitHub do Carlos Alexandre (abre em nova janela)"
              >
                <FaGithub className="w-3 h-3" aria-hidden="true" />
                GitHub
                <FaExternalLinkAlt className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Col 4: Navegação */}
          <div className="text-center sm:text-left">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-3 flex items-center justify-center sm:justify-start gap-2">
              <FaMap className="w-3 h-3" aria-hidden="true" />
              Navegação
            </h3>
            <ul className="space-y-1.5" role="list">
              {PAGES.map(page => (
                <li key={page.href}>
                  <a
                    href={page.href}
                    className="text-xs text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                  >
                    {page.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--color-footer-border)] pt-4 flex flex-col items-center gap-3">
          <nav aria-label="Links institucionais" className="flex flex-wrap items-center justify-center gap-4 text-[10px]">
            <a
              href="/creditos"
              className="text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
            >
              <FaBookOpen className="w-2.5 h-2.5 inline mr-1" aria-hidden="true" />
              Créditos & Fontes
            </a>
            <a
              href="https://github.com/Carlosaleee/Meteor2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
              aria-label="GitHub (abre em nova janela)"
            >
              <FaGithub className="w-2.5 h-2.5 inline mr-1" aria-hidden="true" />
              GitHub
            </a>
            <span className="text-[var(--color-footer-text)]" aria-hidden="true">·</span>
            <span className="text-[var(--color-footer-text)]">
              Feito com dedicação para o Vale do Ribeira
            </span>
          </nav>
          <p className="text-[10px] text-[var(--color-footer-text)]">
            Dados: Open-Meteo · RainViewer · INMET · CPTEC · Mapas: OpenStreetMap
          </p>
        </div>
      </div>
    </footer>
  );
}
