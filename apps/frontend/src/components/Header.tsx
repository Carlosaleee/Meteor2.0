'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { FaHome, FaCloudSun, FaWater, FaCar, FaNewspaper, FaBookOpen, FaInfoCircle, FaMapMarkedAlt, FaGlobe, FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';

const NAV_ITEMS = [
  { href: '/', label: 'Principal', labelEs: 'Principal', icon: FaHome },
  { href: '/meteorologia', label: 'Meteorologia', labelEs: 'Meteorología', icon: FaCloudSun },
  { href: '/swell', label: 'Swell', labelEs: 'Swell', icon: FaWater },
  { href: '/transito', label: 'Trânsito', labelEs: 'Tránsito', icon: FaCar },
  { href: '/noticias', label: 'Notícias', labelEs: 'Noticias', icon: FaNewspaper },
  { href: '/blog', label: 'Blog', labelEs: 'Blog', icon: FaBookOpen },
  { href: '/creditos', label: 'Créditos', labelEs: 'Créditos', icon: FaInfoCircle },
  { href: '/mapa', label: 'Mapa', labelEs: 'Mapa', icon: FaMapMarkedAlt },
];

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'pt' | 'es'>('pt');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('meteor-theme') as 'dark' | 'light' | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('meteor-theme', theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
  const toggleLang = useCallback(() => setLang(prev => prev === 'pt' ? 'es' : 'pt'), []);

  return (
    <header className="w-full bg-[var(--color-header-bg)] shadow-md transition-colors duration-300" role="banner">
      {/* Hero Area with Cover Image */}
      <div className="relative w-full overflow-hidden">
        <Image
          src="/CapaMeteor.jpg"
          alt="Capa Meteor 2.0"
          width={3328}
          height={1248}
          className="w-full h-auto object-contain"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-[var(--color-header-bg)]/80 to-[var(--color-header-bg)]/90" />
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-header-text)]">
                Meteor 2.0
              </h1>
              <p className="mt-1 text-[var(--color-header-muted)] text-sm">
                {lang === 'pt' ? 'Dashboard Tático — Ilha Comprida & Vale do Ribeira' : 'Dashboard Táctico — Ilha Comprida y Vale do Ribeira'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-header-surface)] hover:bg-[var(--color-header-hover)] text-xs font-medium text-[var(--color-header-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-header-bg)]"
                aria-label={lang === 'pt' ? 'Mudar para espanhol' : 'Cambiar a portugués'}
                aria-pressed={lang === 'es'}
              >
                <FaGlobe className="w-3.5 h-3.5 text-[var(--color-gold)]" aria-hidden="true" />
                <span>{lang === 'pt' ? 'PT-BR' : 'ES'}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-header-surface)] hover:bg-[var(--color-header-hover)] text-xs font-medium text-[var(--color-header-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-header-bg)]"
                aria-label={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
                aria-pressed={theme === 'light'}
              >
                {theme === 'dark' ? (
                  <FaSun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                ) : (
                  <FaMoon className="w-3.5 h-3.5 text-[var(--color-gold)]" aria-hidden="true" />
                )}
                <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gold Line */}
      <div className="h-1 w-full bg-[var(--color-gold-line)]" aria-hidden="true" />

      {/* Navigation Bar — Responsive */}
      <nav
        className="w-full bg-[var(--color-header-bg)] border-b border-[var(--color-header-border)]"
        role="navigation"
        aria-label={lang === 'pt' ? 'Menu principal' : 'Menú principal'}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center justify-center gap-1 py-2 text-sm" role="menubar">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const label = lang === 'pt' ? item.label : item.labelEs;

              return (
                <li key={item.href} role="none">
                  <Link
                    href={item.href}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      group flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-header-bg)]
                      ${isActive
                        ? 'bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active-text)] border-b-2 border-[var(--color-gold)]'
                        : 'text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)]'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[var(--color-nav-active-text)]' : 'text-[var(--color-header-muted)] group-hover:text-[var(--color-nav-hover-text)]'}`} aria-hidden="true" />
                    <span className="whitespace-nowrap">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center justify-between py-2">
            <span className="text-sm font-medium text-[var(--color-header-muted)]">
              {lang === 'pt' ? 'Menu' : 'Menú'}
            </span>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="p-2 rounded-lg text-[var(--color-header-muted)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Nav Dropdown */}
          {menuOpen && (
            <ul
              id="mobile-nav"
              className="md:hidden flex flex-col gap-1 pb-4 text-sm"
              role="menubar"
            >
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const label = lang === 'pt' ? item.label : item.labelEs;

                return (
                  <li key={item.href} role="none">
                    <Link
                      href={item.href}
                      role="menuitem"
                      aria-current={isActive ? 'page' : undefined}
                      className={`
                        group flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-all duration-200
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-header-bg)]
                        ${isActive
                          ? 'bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active-text)] border-l-2 border-[var(--color-gold)]'
                          : 'text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)]'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[var(--color-nav-active-text)]' : 'text-[var(--color-header-muted)] group-hover:text-[var(--color-nav-hover-text)]'}`} aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
}
