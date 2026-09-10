export function SkeletonCard() {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800" />
        <div className="w-20 h-3 rounded bg-slate-800" />
      </div>
      <div className="w-16 h-8 rounded bg-slate-800 mb-1" />
      <div className="w-24 h-3 rounded bg-slate-800" />
    </div>
  );
}

export function SkeletonTimeline() {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="w-40 h-5 rounded bg-slate-800 mb-4" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-20 h-24 rounded-xl bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 animate-pulse" aria-hidden="true">
      <div className="w-48 h-5 rounded bg-slate-800 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-16 h-4 rounded bg-slate-800" />
            <div className="flex-1 h-4 rounded bg-slate-800" />
            <div className="w-12 h-4 rounded bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonMap() {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden animate-pulse" aria-hidden="true">
      <div className="w-full h-[350px] bg-slate-800" />
    </div>
  );
}
