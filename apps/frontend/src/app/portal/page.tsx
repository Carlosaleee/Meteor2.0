import Image from "next/image";

async function getNoticias(): Promise<{ data: Array<{ id: number; title: string; slug: string; excerpt: string; cover: string; source: string; publishedAt: string }>; total: number }> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/v1/portal/noticias?limit=6`, { next: { revalidate: 60 } });
    const json = (await res.json()) as { success: boolean; data: { data: unknown[]; total: number } };
    if (json.success) return json.data as never;
    const alt = json as unknown as { data: unknown[]; total: number };
    if (Array.isArray((alt as unknown as { data: unknown[] }).data)) return alt as never;
  } catch {}
  return { data: [], total: 0 };
}

export default async function PortalPage() {
  const { data } = await getNoticias();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="border border-line bg-graphite p-4">
        <h1 className="font-display text-3xl uppercase text-ink">Portal de Notícias</h1>
        <p className="mt-2 font-mono text-xs tracking-[0.12em] text-muted uppercase">
          Vale do Ribeira • Ilha Comprida • Antenado a novas tendências — g1 + climmatempo
        </p>
        <div className="mt-4 h-48 w-full overflow-hidden border border-line bg-surface">
          <Image src="/CapaMeteor.jpg" alt="Meteor capa" width={1200} height={630} className="h-full w-full object-cover" priority />
        </div>
      </div>

      <section className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.length === 0 ? (
          <div className="col-span-full border border-line bg-surface p-6 text-center font-mono text-sm text-muted">
            Nenhuma notícia — MRAG ainda ingerindo g1/valedoribeira + climmatempo
          </div>
        ) : (
          data.map((n) => (
            <article key={n.id} className="border border-line bg-graphite p-3 hover:border-orange">
              <div className="h-32 w-full overflow-hidden bg-surface">
                <Image src={n.cover || "/CapaMeteor.jpg"} alt={n.title} width={400} height={200} className="h-full w-full object-cover" />
              </div>
              <div className="mt-3">
                <span className="border border-line bg-bg px-2 py-0.5 font-mono text-[10px] uppercase text-muted">{n.source}</span>
                <h2 className="mt-2 font-display text-sm uppercase leading-tight text-ink">{n.title}</h2>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted">{n.excerpt}</p>
                <p className="mt-2 font-mono text-[10px] text-muted">{new Date(n.publishedAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
