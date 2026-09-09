import { FaDatabase, FaCode, FaExternalLinkAlt, FaGithub, FaUser } from 'react-icons/fa';

const DATA_SOURCES = [
  { name: 'Open-Meteo', url: 'https://open-meteo.com' },
  { name: 'INMET', url: 'https://apitempo.inmet.gov.br' },
  { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org' },
  { name: 'Leaflet', url: 'https://leafletjs.com' },
];

const TECH_STACK = [
  { name: 'Next.js 15', url: 'https://nextjs.org' },
  { name: 'NestJS', url: 'https://nestjs.com' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  { name: 'Leaflet', url: 'https://leafletjs.com' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--color-footer-bg)] mt-auto transition-colors duration-300" role="contentinfo">
      {/* Gold Line */}
      <div className="h-1 w-full bg-[var(--color-gold-line)]" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Branding */}
          <div>
            <h2 className="text-lg font-bold text-[var(--color-footer-heading)] mb-3">
              Meteor 2.0
            </h2>
            <p className="text-sm text-[var(--color-footer-text)] leading-relaxed mb-3">
              Dashboard tático de telemetria para Ilha Comprida e Vale do Ribeira.
            </p>
            <p className="text-xs text-[var(--color-footer-text)]">
              &copy; {year} Meteor 2.0. Licenciado sob MIT License.
            </p>
          </div>

          {/* Column 2: Desenvolvedor */}
          <div>
            <h3 className="text-sm font-bold text-[var(--color-footer-heading)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <FaUser className="w-3.5 h-3.5 text-[var(--color-gold)]" aria-hidden="true" />
              Desenvolvedor
            </h3>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--color-footer-heading)]">
                Carlos Alexandre
              </p>
              <p className="text-xs text-[var(--color-footer-text)]">
                Full Stack Developer
              </p>
              <a
                href="https://github.com/Carlosaleee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                aria-label="GitHub do Carlos Alexandre (abre em nova janela)"
              >
                <FaGithub className="w-3.5 h-3.5" aria-hidden="true" />
                GitHub
                <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-50" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 3: Data Sources */}
          <div>
            <h3 className="text-sm font-bold text-[var(--color-footer-heading)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <FaDatabase className="w-3.5 h-3.5 text-[var(--color-gold)]" aria-hidden="true" />
              Fontes de Dados
            </h3>
            <ul className="space-y-2" role="list">
              {DATA_SOURCES.map(source => (
                <li key={source.name}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                    aria-label={`${source.name} (abre em nova janela)`}
                  >
                    <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    <span>{source.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Tech Stack */}
          <div>
            <h3 className="text-sm font-bold text-[var(--color-footer-heading)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <FaCode className="w-3.5 h-3.5 text-[var(--color-gold)]" aria-hidden="true" />
              Stack Tecnológica
            </h3>
            <ul className="space-y-2" role="list">
              {TECH_STACK.map(tech => (
                <li key={tech.name}>
                  <a
                    href={tech.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
                    aria-label={`${tech.name} (abre em nova janela)`}
                  >
                    <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    <span>{tech.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--color-footer-border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <nav aria-label="Links institucionais" className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="/creditos"
              className="text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
            >
              Créditos & Fontes
            </a>
            <a
              href="https://github.com/Carlosaleee/Meteor2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded"
              aria-label="GitHub (abre em nova janela)"
            >
              GitHub
            </a>
            <span className="text-[var(--color-footer-text)]" aria-hidden="true">·</span>
            <span className="text-[var(--color-footer-text)]">
              Feito com dedicacao para o Vale do Ribeira
            </span>
          </nav>

          <p className="text-xs text-[var(--color-footer-text)]">
            Dados: Open-Meteo · Mapas: OpenStreetMap
          </p>
        </div>
      </div>
    </footer>
  );
}
