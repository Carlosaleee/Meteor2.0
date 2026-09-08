import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Globe, Bot, X, Send, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';

export function Header() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'pt' | 'es'>('pt');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'pt' ? 'es' : 'pt');

  return (
    <header className="w-full bg-slate-900 text-white shadow-md transition-colors duration-300">
      {/* Área de Capa (Hero) */}
      <div className="w-full bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 py-10 px-6 text-center border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Meteor 2.0</h1>
            <p className="mt-1 text-slate-400 text-sm">Dashboard Tático — Ilha Comprida & Vale do Ribeira</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Seletor de Idioma */}
            <button 
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              title="Mudar Idioma"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'pt' ? 'PT-BR' : 'ES'}</span>
            </button>

            {/* Seletor de Tema Claro/Escuro */}
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
              <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu de Navegação (Navbar) com as 7 rotas */}
      <nav className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto py-1 text-sm">
          <Link href="/" className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-medium transition-colors">
            {lang === 'pt' ? 'Principal' : 'Principal'}
          </Link>
          <Link href="/meteorologia" className="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-medium transition-colors">
            {lang === 'pt' ? 'Meteorologia' : 'Meteorología'}
          </Link>
          <Link href="/swell" className="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-medium transition-colors">
            Swell
          </Link>
          <Link href="/transito" className="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-medium transition-colors">
            {lang === 'pt' ? 'Trânsito' : 'Tránsito'}
          </Link>
          <Link href="/noticias" className="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-medium transition-colors">
            {lang === 'pt' ? 'Notícias' : 'Noticias'}
          </Link>
          <Link href="/blog" className="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-medium transition-colors">
            Blog
          </Link>
          <Link href="/creditos" className="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-medium transition-colors">
            {lang === 'pt' ? 'Créditos' : 'Créditos'}
          </Link>
        </div>
      </nav>
    </header>
  );
}
