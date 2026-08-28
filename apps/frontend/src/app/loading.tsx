export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6">
      <div className="border-b border-line pb-4">
        <div className="h-8 w-40 animate-pulse bg-surface" aria-hidden />
        <div className="mt-2 h-3 w-64 animate-pulse bg-graphite" aria-hidden />
      </div>
      <div className="grid gap-3 lg:grid-cols-12" aria-busy="true" aria-live="polite">
        <div className="h-32 animate-pulse bg-graphite lg:col-span-4" />
        <div className="h-32 animate-pulse bg-surface lg:col-span-8" />
        <div className="h-24 animate-pulse bg-graphite lg:col-span-12" />
      </div>
      <p className="font-mono text-xs tracking-[0.12em] text-muted uppercase">Syncing feeds…</p>
    </main>
  );
}
