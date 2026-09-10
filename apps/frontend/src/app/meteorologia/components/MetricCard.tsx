import { type IconType } from 'react-icons';

type MetricCardProps = {
  icon: IconType;
  label: string;
  value: string | number;
  unit: string;
  subLabel?: string;
  color?: string;
  ariaLabel?: string;
};

export function MetricCard({ icon: Icon, label, value, unit, subLabel, color = 'text-cyan-400', ariaLabel }: MetricCardProps) {
  return (
    <div
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2 hover:border-slate-700 transition-colors"
      aria-label={ariaLabel ?? `${label}: ${value} ${unit}`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg bg-slate-800 ${color}`} aria-hidden="true">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white tabular-nums">{value}</span>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
      {subLabel && (
        <span className="text-xs text-slate-500">{subLabel}</span>
      )}
    </div>
  );
}
