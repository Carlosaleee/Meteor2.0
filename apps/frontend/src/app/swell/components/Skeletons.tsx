'use client';

export function SkeletonResumoIA() {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800" />
        <div className="h-4 bg-slate-800 rounded w-32" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-4/5" />
        <div className="h-3 bg-slate-800 rounded w-3/5" />
      </div>
    </section>
  );
}

export function SkeletonWaveChart() {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="h-4 bg-slate-800 rounded w-40 mb-4" />
      <div className="h-[300px] bg-slate-800/50 rounded-xl" />
    </section>
  );
}

export function SkeletonTideChart() {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="h-4 bg-slate-800 rounded w-32 mb-4" />
      <div className="h-[280px] bg-slate-800/50 rounded-xl" />
    </section>
  );
}

export function SkeletonSpotGrid() {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="h-4 bg-slate-800 rounded w-48 mb-4" />
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-7 bg-slate-800 rounded-lg w-20" />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
    </section>
  );
}

export function SkeletonSurfNews() {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="h-4 bg-slate-800 rounded w-36 mb-4" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-64 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
    </section>
  );
}

export function SkeletonRankings() {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="h-4 bg-slate-800 rounded w-32 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-800/50 rounded-lg" />
        ))}
      </div>
    </section>
  );
}

export function SkeletonEvents() {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="h-4 bg-slate-800 rounded w-36 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
    </section>
  );
}

export function SkeletonHourly() {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="h-4 bg-slate-800 rounded w-48 mb-4" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-20 h-28 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
    </section>
  );
}
