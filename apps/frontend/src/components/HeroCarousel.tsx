'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight, FaPause, FaPlay } from 'react-icons/fa';
import { useDict } from '@/i18n/context';
import { home } from '@/i18n/dictionaries/home';
import { fmt } from '@/i18n/format';

type Slide = {
  id: number;
  titleKey: string;
  subtitleKey: string;
  href: string;
  image: string;
  gradient: string;
  labelKey: string;
};

/** Ordem espelha a seção da capa: noticias primeiro, depois tempo, mar, comercio e blog. */
const SLIDES: Slide[] = [
  {
    id: 0,
    titleKey: 'hero.s0.title',
    subtitleKey: 'hero.s0.subtitle',
    href: '/noticias',
    image: '/banner-meteor.jpg',
    gradient: 'from-slate-900/90 via-blue-900/70 to-slate-900/80',
    labelKey: 'hero.s0.label',
  },
  {
    id: 1,
    titleKey: 'hero.s1.title',
    subtitleKey: 'hero.s1.subtitle',
    href: '/meteorologia',
    image: '/banner-meteor.jpg',
    gradient: 'from-amber-900/90 via-amber-800/70 to-slate-900/80',
    labelKey: 'hero.s1.label',
  },
  {
    id: 2,
    titleKey: 'hero.s2.title',
    subtitleKey: 'hero.s2.subtitle',
    href: '/swell',
    image: '/CapaMeteor.jpg',
    gradient: 'from-blue-900/90 via-blue-800/70 to-slate-900/80',
    labelKey: 'hero.s2.label',
  },
  {
    id: 3,
    titleKey: 'hero.s3.title',
    subtitleKey: 'hero.s3.subtitle',
    href: '/comercio',
    image: '/CapaMeteor.jpg',
    gradient: 'from-orange-900/90 via-amber-900/70 to-slate-900/80',
    labelKey: 'hero.s3.label',
  },
  {
    id: 4,
    titleKey: 'hero.s4.title',
    subtitleKey: 'hero.s4.subtitle',
    href: '/blog',
    image: '/banner-meteor.jpg',
    gradient: 'from-emerald-900/90 via-teal-900/70 to-slate-900/80',
    labelKey: 'hero.s4.label',
  },
];

const INTERVAL_MS = 5000;

type HeroCarouselProps = {
  compact?: boolean;
};

export function HeroCarousel({ compact = false }: HeroCarouselProps) {
  const t = useDict(home);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  // Sem autoplay para quem prefere menos movimento (WCAG 2.2.2 / 2.3.3).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (paused || userPaused || reducedMotion) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, userPaused, reducedMotion, next]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  const slide = SLIDES[current];

  return (
    <section
      role="region"
      aria-roledescription="carrossel"
      aria-label={compact ? t['hero.regionCompact'] : t['hero.region']}
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height: compact ? 'clamp(180px, 22vw, 240px)' : 'clamp(280px, 40vw, 420px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKeyDown}
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          role="group"
          aria-roledescription="slide"
          aria-label={fmt(t['hero.slideOf'], { i: i + 1, n: SLIDES.length, title: t[s.titleKey] })}
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
                {t[s.labelKey]}
              </span>
              <h2 className={compact ? 'text-xl md:text-3xl font-extrabold text-white tracking-tight mb-1 font-[family-name:var(--font-display)]' : 'text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 font-[family-name:var(--font-display)]'}>
                {t[s.titleKey]}
              </h2>
              <p className={compact ? 'text-xs md:text-sm text-white/70 max-w-md mb-2 line-clamp-1 md:line-clamp-2' : 'text-sm md:text-base text-white/70 max-w-lg mb-4'}>
                {t[s.subtitleKey]}
              </p>
              <Link
                href={s.href}
                className={compact ? 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white' : 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'}
              >
                {t['hero.explore']}
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        aria-label={t['hero.prev']}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <FaChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={next}
        aria-label={t['hero.next']}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <FaChevronRight className="w-4 h-4" />
      </button>

      {/* Pausa manual exigida pela WCAG 2.2.2; escondida quando o SO ja reduz o movimento. */}
      {!reducedMotion && (
        <button
          onClick={() => setUserPaused(v => !v)}
          aria-pressed={userPaused}
          aria-label={userPaused ? t['hero.play'] : t['hero.pause']}
          className="absolute bottom-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {userPaused ? <FaPlay className="w-3.5 h-3.5" /> : <FaPause className="w-3.5 h-3.5" />}
        </button>
      )}

      <div
        role="tablist"
        aria-label={t['hero.navAria']}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2"
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={fmt(t['hero.goToSlide'], { title: t[s.titleKey] })}
            onClick={() => goTo(i)}
            /* Alvo de 24x24 (WCAG 2.5.8) com o ponto visual de 10px dentro. */
            className="w-6 h-6 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span
              aria-hidden="true"
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === current ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          </button>
        ))}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {fmt(t['hero.announce'], { i: current + 1, n: SLIDES.length, title: t[slide.titleKey] })}
      </div>
    </section>
  );
}
