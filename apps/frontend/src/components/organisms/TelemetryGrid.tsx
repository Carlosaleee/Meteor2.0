import { SurfScore } from "@/components/atoms/SurfScore";
import { SourceStrip } from "@/components/molecules/SourceStrip";
import { WindSwellMeters } from "@/components/molecules/WindSwellMeters";
import { WaveChart } from "@/components/organisms/WaveChart";
import type { Forecast } from "@/lib/schemas";

type TelemetryGridProps = {
  forecast: Forecast;
  dayIndex: number;
  summary: string;
};

export function TelemetryGrid({ forecast, dayIndex, summary }: TelemetryGridProps) {
  return (
    <section className="grid gap-3 lg:grid-cols-12" aria-live="polite" aria-label="Telemetry grid">
      <div className="lg:col-span-4">
        <SurfScore score={forecast.surfScore} />
      </div>
      <div className="lg:col-span-8">
        <WindSwellMeters forecast={forecast} />
      </div>
      <div className="lg:col-span-12">
        <WaveChart points={forecast.marine?.hourly ?? []} dayIndex={dayIndex} />
      </div>
      <div className="border border-line p-3 lg:col-span-12">
        <div className="mb-2 font-mono text-[10px] tracking-[0.14em] text-muted uppercase" id="brief-title">
          Gemini brief
        </div>
        <p className="font-mono text-sm leading-relaxed text-ink" aria-labelledby="brief-title">
          {summary || "—"}
        </p>
      </div>
      <div className="lg:col-span-12">
        <SourceStrip sources={forecast.sources} />
      </div>
    </section>
  );
}
