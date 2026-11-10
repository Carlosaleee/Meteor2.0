'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { FaHome, FaCloudSun, FaWater, FaNewspaper, FaStore, FaBookOpen, FaInfoCircle, FaGlobe, FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';
import { useI18n, useDict } from '@/i18n/context';
import { common } from '@/i18n/dictionaries/common';

const NAV_ITEMS = [
  { href: '/', key: 'principal', icon: FaHome },
  { href: '/meteorologia', key: 'meteorologia', icon: FaCloudSun },
  { href: '/swell', key: 'swell', icon: FaWater },
  { href: '/noticias', key: 'noticias', icon: FaNewspaper },
  { href: '/comercio', key: 'comercio', icon: FaStore },
  { href: '/blog', key: 'blog', icon: FaBookOpen },
  { href: '/creditos', key: 'creditos', icon: FaInfoCircle },
];

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { lang, setLang } = useI18n();
  const t = useDict(common);
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
  const toggleLang = useCallback(() => setLang(lang === 'pt' ? 'es' : 'pt'), [lang, setLang]);

  return (
    <header className="w-full bg-[var(--color-header-bg)] sticky top-0 z-50 transition-colors duration-300" role="banner">
      {/* Gold Line — Top */}
      <div className="h-px w-full bg-[var(--color-gold-line)]" aria-hidden="true" />

      {/* Navigation Bar */}
      <nav
        className="w-full bg-[var(--color-header-bg)]"
        role="navigation"
        aria-label={t['header.nav.ariaLabel']}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Desktop: Logo + Nav + Theme Toggle */}
          {/* O nav completo so cabe a partir de xl (1280px) — em md/lg ele estoura a largura. */}
          <div className="hidden xl:flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={t['header.logo.ariaLabel']}>
              <FaWater className="w-6 h-6 text-cyan-400" aria-hidden="true" />
              <span className="text-xl font-bold text-[var(--color-header-text)] tracking-tight">
                Meteor
              </span>
            </Link>

            {/* Nav Items */}
            <ul className="flex items-center gap-1" role="menubar">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const label = t[`nav.${item.key}`];

                return (
                  <li key={item.href} role="none">
                    <Link
                      href={item.href}
                      role="menuitem"
                      aria-current={isActive ? 'page' : undefined}
                      title={t[`nav.desc.${item.key}`]}
                      className={`
                        group flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-header-bg)]
                        ${isActive
                          ? 'border border-cyan-400 text-cyan-400 bg-[var(--color-nav-active-bg)]'
                          : 'border border-transparent text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)]'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-[var(--color-header-muted)] group-hover:text-[var(--color-nav-hover-text)]'}`} aria-hidden="true" />
                      <span className="whitespace-nowrap">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Theme + Lang Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleLang}
                className="p-2 rounded-lg text-[var(--color-header-muted)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={t['header.lang.ariaLabel']}
                aria-pressed={lang === 'es'}
                title={t['header.lang.title']}
              >
                <FaGlobe className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--color-header-muted)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={theme === 'dark' ? t['header.theme.toLight'] : t['header.theme.toDark']}
                aria-pressed={theme === 'light'}
                title={t['header.theme.title']}
              >
                {theme === 'dark' ? (
                  <FaSun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <FaMoon className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile: Logo + Hamburger */}
          <div className="xl:hidden flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2" aria-label={t['header.logo.ariaLabel']}>
              <FaWater className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              <span className="text-lg font-bold text-[var(--color-header-text)] tracking-tight">
                Meteor
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleLang}
                className="p-2 rounded-lg text-[var(--color-header-muted)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={t['header.lang.ariaLabel']}
                aria-pressed={lang === 'es'}
                title={t['header.lang.title']}
              >
                <FaGlobe className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--color-header-muted)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={theme === 'dark' ? t['header.theme.toLight'] : t['header.theme.toDark']}
                aria-pressed={theme === 'light'}
                title={t['header.theme.title']}
              >
                {theme === 'dark' ? (
                  <FaSun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <FaMoon className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                )}
              </button>

              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className="p-2 rounded-lg text-[var(--color-header-muted)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={menuOpen ? t['header.menu.close'] : t['header.menu.open']}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
              >
                {menuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          {menuOpen && (
            <ul
              id="mobile-nav"
              className="xl:hidden flex flex-col gap-1 pb-4 text-sm"
              role="menubar"
              aria-live="polite"
            >
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const label = t[`nav.${item.key}`];

                return (
                  <li key={item.href} role="none">
                    <Link
                      href={item.href}
                      role="menuitem"
                      aria-current={isActive ? 'page' : undefined}
                      title={t[`nav.desc.${item.key}`]}
                      className={`
                        group flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-all duration-200
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-header-bg)]
                        ${isActive
                          ? 'border-l-2 border-cyan-400 text-cyan-400 bg-[var(--color-nav-active-bg)]'
                          : 'text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)]'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-[var(--color-header-muted)] group-hover:text-[var(--color-nav-hover-text)]'}`} aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* Gold Line — Bottom */}
      <div className="h-px w-full bg-[var(--color-gold-line)]" aria-hidden="true" />
    </header>
  );
}
