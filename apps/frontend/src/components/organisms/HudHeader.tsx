"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { CitySelector } from "@/components/molecules/CitySelector";
import { DaySelector } from "@/components/molecules/DaySelector";

// Fallback type – replace with the proper schema when available.
export type Location = {
  id: string;
  name: string;
};

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
          <Link href="/mapa" className="border border-line bg-surface px-2 py-1 font-mono" 
            ...
        </div>
      ...
    </header>
  );
}
