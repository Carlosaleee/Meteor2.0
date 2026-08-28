"use client";

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
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
          Ilha Comprida / Vale do Ribeira · Telemetry
        </p>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <CitySelector locations={locations} value={locationId} onChange={onLocation} />
        <DaySelector value={dayIndex} onChange={onDay} />
      </div>
    </header>
  );
}
