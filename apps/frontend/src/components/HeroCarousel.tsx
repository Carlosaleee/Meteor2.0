'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

type Slide = {
  id: number;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  gradient: string;
  label: string;
};

const SLIDES: Slide[] = [
  {
    id: 0,
    title: 'Previsão do Tempo',
    subtitle: 'Previsão do tempo, satélite e modelos numéricos para 4 cidades',
    href: '/meteorologia',
    image: '/banner-meteor.jpg',
    gradient: 'from-amber-900/90 via-amber-800/70 to-slate-900/80',
    label: 'Clima & Tempo',
  },
  {
    id: 1,
    title: 'Swell & Points',
    subtitle: 'Telemetria de ondas, marés e 12 points de surf em Ilha Comprida',
    href: '/swell',
    image: '/CapaMeteor.jpg',
    gradient: 'from-blue-900/90 via-blue-800/70 to-slate-900/80',
    label: 'Surf & Ondas',
  },
  {
    id: 2,
    title: 'Notícias do Vale',
    subtitle: 'Feed unificado de notícias, trânsito e turismo da região',
    href: '/noticias',
    image: '/banner-meteor.jpg',
    gradient: 'from-slate-900/90 via-blue-900/70 to-slate-900/80',
    label: 'Regionais',
  },
  {
    id: 3,
    title: 'Comércio Local',
    subtitle: 'Diretório completo de estabelecimentos de Ilha Comprida',
    href: '/comercio',
    image: '/CapaMeteor.jpg',
    gradient: 'from-orange-900/90 via-amber-900/70 to-slate-900/80',
    label: 'Diretório',
  },
  {
    id: 4,
    title: 'Blog Técnico',
    subtitle: 'Artigos e guias especiais sobre o clima e litoral',
    href: '/blog',
    image: '/banner-meteor.jpg',
    gradient: 'from-emerald-900/90 via-teal-900/70 to-slate-900/80',
    label: 'Artigos',
  },
];

const INTERVAL_MS = 5000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <section
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques do Meteor 2.0"
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height: 'clamp(280px, 40vw, 420px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${i + 1} de ${SLIDES.length}: ${s.title}`}
          aria-hidden={i !== current}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <Image
            src={s.image}
            alt=""
            fill
            className={`object-cover object-center ${i === current ? 'animate-zoom-slow' : ''}`}
            sizes="100vw"
            priority={i === 0}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`} />

          <div className="absolute inset-0 flex items-end md:items-center">
            <div className="w-full max-w-7xl mx-auto px-6 pb-8 md:pb-0">
              <span className="inline-block px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-sm rounded-full text-white/80 border border-white/10">
                {s.label}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 font-[family-name:var(--font-display)]">
                {s.title}
              </h2>
              <p className="text-sm md:text-base text-white/70 max-w-lg mb-4">
                {s.subtitle}
              </p>
              <Link
                href={s.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Explorar →
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <FaChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={next}
        aria-label="Próximo slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <FaChevronRight className="w-4 h-4" />
      </button>

      <div
        role="tablist"
        aria-label="Navegação do carrossel"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2"
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Ir para slide: ${s.title}`}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              i === current
                ? 'bg-white scale-110'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Slide {current + 1} de {SLIDES.length}: {slide.title}
      </div>
    </section>
  );
}
