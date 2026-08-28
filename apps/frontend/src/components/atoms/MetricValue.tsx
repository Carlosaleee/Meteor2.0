type MetricValueProps = {
  label: string;
  value: string;
  unit?: string;
  accent?: "orange" | "gold" | "ink";
};

const accentClass = {
  orange: "text-orange",
  gold: "text-gold",
  ink: "text-ink",
} as const;

export function MetricValue({ label, value, unit, accent = "ink" }: MetricValueProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-line px-3 py-2 last:border-b-0">
      <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">{label}</span>
      <span className={`font-mono text-2xl leading-none ${accentClass[accent]}`}>
        {value}
        {unit ? <span className="ml-1 text-xs text-muted">{unit}</span> : null}
      </span>
    </div>
  );
}
