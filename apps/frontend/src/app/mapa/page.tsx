import { SpotMap } from "@/components/organisms/SpotMap";

export default function MapaPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="border border-line bg-graphite p-4">
        <h1 className="font-display text-3xl uppercase text-ink">Mapa — Vale do Ribeira</h1>
        <p className="mt-2 font-mono text-xs tracking-[0.12em] text-muted uppercase">Leaflet OSM • 6 spots • A712/A746 • climmatempo + g1 como base</p>
      </div>
      <div className="mt-6">
        <SpotMap />
      </div>
    </main>
  );
}
