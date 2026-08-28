"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6">
      <div className="border border-hazard bg-graphite p-4">
        <h2 className="font-display text-lg uppercase text-hazard">Link Down</h2>
        <p className="mt-2 font-mono text-sm text-ink">{error.message || "Forecast feed unavailable"}</p>
        {error.digest && <p className="mt-1 font-mono text-[10px] text-muted">digest: {error.digest}</p>}
        <button
          onClick={reset}
          className="mt-4 border border-orange bg-bg px-4 py-2 font-mono text-xs tracking-[0.12em] text-orange uppercase hover:bg-graphite"
          aria-label="Tentar novamente"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
