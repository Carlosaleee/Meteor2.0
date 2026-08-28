import { MetricValue } from "@/components/atoms/MetricValue";
import type { Forecast } from "@/lib/schemas";

type WindSwellMetersProps = {
  forecast: Forecast;
};

function fmt(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) {
    return "—";
  }
  return n.toFixed(digits);
}

export function WindSwellMeters({ forecast }: WindSwellMetersProps) {
  return (
    <div className="grid grid-cols-2 border border-line">
      <MetricValue
        label="Wind"
        value={fmt(forecast.atmosphere?.windSpeedMs)}
        unit="m/s"
        accent="orange"
      />
      <MetricValue
        label="Dir"
        value={fmt(forecast.atmosphere?.windDirectionDeg, 0)}
        unit="°"
        accent="orange"
      />
      <MetricValue label="Swell" value={fmt(forecast.marine?.swellHeightM)} unit="m" accent="gold" />
      <MetricValue label="Period" value={fmt(forecast.marine?.wavePeriodS)} unit="s" accent="gold" />
      <MetricValue label="Wave" value={fmt(forecast.marine?.waveHeightM)} unit="m" accent="gold" />
      <MetricValue
        label="Temp"
        value={fmt(forecast.atmosphere?.temperatureC, 0)}
        unit="°C"
        accent="ink"
      />
    </div>
  );
}
