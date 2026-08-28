"use client";

import { HudHeader } from "@/components/organisms/HudHeader";
import { TelemetryGrid } from "@/components/organisms/TelemetryGrid";
import { useForecastBoard } from "@/hooks/useForecastBoard";

export function DashboardHud() {
  const board = useForecastBoard();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6">
      <HudHeader
        locations={board.locations}
        locationId={board.locationId}
        onLocation={board.setLocationId}
        dayIndex={board.dayIndex}
        onDay={board.setDayIndex}
      />
      {board.loading ? (
        <p className="font-mono text-xs tracking-[0.12em] text-orange uppercase">Syncing feeds…</p>
      ) : null}
      {board.error ? (
        <p className="font-mono text-sm text-hazard">{board.error}</p>
      ) : null}
      {board.forecast ? (
        <TelemetryGrid forecast={board.forecast} dayIndex={board.dayIndex} summary={board.summary} />
      ) : null}
    </main>
  );
}
