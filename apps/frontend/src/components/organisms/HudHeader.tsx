"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { CitySelector } from "@/components/molecules/CitySelector";
import { DaySelector } from "@/components/molecules/DaySelector";
import type { Location } from "@/lib/schemas";

type HudHeaderProps = {
  locations: Location[];
  locationId: string;
  onLocation: (id: string) => void;
  dayIndex: number;
  onDay: (index: number) => void;
};

export function HudHeader({ locations, locationId, onLocation, dayIndex, onDay }: HudHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-4">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-4xl uppercase tracking-tight text-ink">Meteor</h1>
        <div className="flex items-center gap-2">
          <Link href="/portal" className="border border-line bg-surface px-2 py-1 font-mono text-[10px] uppercase text-muted hover:border-orange hover:text-orange">
            Portal
          </Link>
          <Link href="/mapa" className="border border-line bg-surface px-2 py-1 font-mono text-[10px] uppercase text-muted hover:border-orange hover:text-orange">
            Mapa
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
        Ilha Comprida / Vale do Ribeira · Telemetry — g1 + climmatempo + MRAG
      </p>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <CitySelector locations={locations} value={locationId} onChange={onLocation} />
        <DaySelector value={dayIndex} onChange={onDay} />
      </div>
    </header>
  );
}
