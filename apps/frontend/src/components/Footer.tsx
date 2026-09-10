'use client';

import { FaDatabase, FaCode, FaExternalLinkAlt, FaGithub, FaMap, FaRobot, FaPaperPlane } from 'react-icons/fa';
import { useState } from 'react';

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
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'bot'; text: string }>>([
    { role: 'bot', text: 'Olá! Sou o MeteorBot. Como posso ajudar?' }
  ]);

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setTimeout(() => {
      let reply = 'Condições estáveis em Ilha Comprida e Vale do Ribeira.';
      if (msg.toLowerCase().includes('vento')) reply = 'Ventos de SE a 15 km/h.';
      else if (msg.toLowerCase().includes('chuva')) reply = 'Sem chuva prevista para hoje.';
      else if (msg.toLowerCase().includes('balsa')) reply = 'Balsa operando com 15 min de espera.';
      setChatMessages(prev => [...prev, { role: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <footer className="w-full bg-[var(--color-footer-bg)] mt-auto transition-colors duration-300" role="contentinfo">
      {/* Gold Line */}
      <div className="h-px w-full bg-[var(--color-gold-line)]" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Row 1 — Project Description (centered, gold) */}
        <div className="text-center mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--color-gold)] tracking-wide uppercase">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Navegação */}
          <div className="text-center">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <FaMap className="w-3 h-3" aria-hidden="true" />
              Navegação
            </h3>
            <ul className="space-y-2" role="list">
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

          {/* Col 2: Fontes de Dados */}
          <div className="text-center">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <FaDatabase className="w-3 h-3" aria-hidden="true" />
              Fontes de Dados
            </h3>
            <ul className="space-y-2" role="list">
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

          {/* Col 3: Stack Tecnológica */}
          <div className="text-center">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <FaCode className="w-3 h-3" aria-hidden="true" />
              Stack Tecnológica
            </h3>
            <ul className="space-y-2" role="list">
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

          {/* Col 4: Chatbot Card */}
          <div className="text-center">
            <h3 className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <FaRobot className="w-3 h-3" aria-hidden="true" />
              Assistente IA
            </h3>
            <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-[var(--color-gold)]/10">
                  <FaRobot className="w-5 h-5 text-[var(--color-gold)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-footer-heading)]">MeteorBot</p>
                  <p className="text-[10px] text-[var(--color-footer-text)]">Assistente Tático</p>
                </div>
              </div>

              {/* Mini chat */}
              <div className="space-y-2 mb-3 max-h-24 overflow-y-auto">
                {chatMessages.slice(-3).map((m, i) => (
                  <div key={i} className={`text-[10px] p-2 rounded ${m.role === 'user' ? 'bg-[var(--color-gold)]/10 text-[var(--color-footer-heading)] ml-4' : 'bg-[var(--color-line)] text-[var(--color-footer-text)] mr-4'}`}>
                    {m.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleChat} className="flex gap-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Pergunte..."
                  className="flex-1 bg-[var(--color-bg)] border border-[var(--color-line)] rounded px-2 py-1.5 text-[10px] text-[var(--color-footer-heading)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
                  aria-label="Digite sua pergunta para o MeteorBot"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
                  aria-label="Enviar mensagem"
                >
                  <FaPaperPlane className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--color-footer-border)] pt-6 flex flex-col items-center gap-3">
          <p className="text-xs text-[var(--color-footer-text)]">
            <span className="text-[var(--color-gold)] font-semibold">Meteor</span> — Créditos de Desenvolvimento:{' '}
            <a
              href="https://github.com/Carlosaleee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-footer-link)] hover:text-[var(--color-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded inline-flex items-center gap-1"
              aria-label="GitHub do Carlos Alexandre (abre em nova janela)"
            >
              Carlos Alexandre
              <FaGithub className="w-3 h-3" aria-hidden="true" />
            </a>
          </p>
          <p className="text-[10px] text-[var(--color-footer-text)]">
            Dados: Open-Meteo · RainViewer · INMET · CPTEC · Mapas: OpenStreetMap
          </p>
        </div>
      </div>
    </footer>
  );
}
