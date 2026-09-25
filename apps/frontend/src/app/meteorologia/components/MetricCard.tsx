import { type IconType } from 'react-icons';

type MetricCardProps = {
  icon: IconType;
  label: string;
  value: string | number;
  unit: string;
  subLabel?: string;
  tip?: string;
  color?: string;
  ariaLabel?: string;
};

const TIPS: Record<string, string> = {
  Temperatura: 'Temperatura do ar em graus Celsius. Sensação térmica pode variar com vento e umidade.',
  Umidade: 'Umidade relativa do ar em porcentagem. Acima de 70% é considerado abafado.',
  Vento: 'Velocidade do vento em km/h. Direção indica de onde o vento está sopando.',
  Chuva: 'Precipitação acumulada em milímetros nas últimas horas.',
  Pressão: 'Pressão atmosférica em hectopascais. Queda indica possibilidade de chuva.',
  Nuvens: 'Porcentagem do céu coberto por nuvens. 0% = céu limpo, 100% = totalmente nublado.',
  'Índice UV': 'Nível de radiação UV do sol. 1-2 baixo, 3-5 moderado, 6-7 alto, 8+ muito alto.',
  Visibilidade: 'Distância de visão em km. Abaixo de 1km indica neblina ou chuva forte.',
};

export function MetricCard({ icon: Icon, label, value, unit, subLabel, tip, color = 'text-cyan-400', ariaLabel }: MetricCardProps) {
  const tooltip = tip ?? TIPS[label] ?? `${label}: ${value} ${unit}`;

  return (
    <div
      className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-slate-700 transition-colors"
      aria-label={ariaLabel ?? `${label}: ${value} ${unit}`}
      title={tooltip}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg bg-slate-800 ${color}`} aria-hidden="true">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      {subLabel && (
        <span className="text-[10px] text-slate-500">{subLabel}</span>
      )}
    </div>
  );
}
