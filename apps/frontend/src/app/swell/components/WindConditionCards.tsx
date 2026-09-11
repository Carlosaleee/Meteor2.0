'use client';

import { FaWind, FaArrowUp, FaCompass, FaFlag } from 'react-icons/fa';
import { windQuality, windDir, beaufortScale, beaufortDescription, kitesurfWindQuality } from './windUtils';

type WindConditionCardsProps = {
  windSpeed: number;
  windDirection: number;
  windGust: number;
};

function windDirLabel(deg: number): string {
  return `${deg}° ${windDir(deg)}`;
}

export function WindConditionCards({ windSpeed, windDirection, windGust }: WindConditionCardsProps) {
  const quality = windQuality(windSpeed);
  const kitesurf = kitesurfWindQuality(windSpeed);
  const beaufort = beaufortScale(windSpeed);
  const beaufortDesc = beaufortDescription(beaufort);

  const cards = [
    {
      icon: FaWind,
      label: 'Velocidade',
      value: windSpeed.toFixed(1),
      unit: 'km/h',
      subtext: quality.label,
      subtextColor: quality.textClass,
      title: `Velocidade do vento: ${windSpeed.toFixed(1)} km/h — ${quality.label}`,
      ariaLabel: `Velocidade do vento: ${windSpeed.toFixed(1)} km/h`,
    },
    {
      icon: FaArrowUp,
      label: 'Rajada',
      value: windGust.toFixed(1),
      unit: 'km/h',
      subtext: windGust > windSpeed * 1.3 ? 'Forte rajada' : 'Normal',
      subtextColor: windGust > windSpeed * 1.3 ? 'text-amber-400' : 'text-slate-400',
      title: `Rajada: ${windGust.toFixed(1)} km/h`,
      ariaLabel: `Rajada: ${windGust.toFixed(1)} km/h`,
    },
    {
      icon: FaCompass,
      label: 'Direção',
      value: windDirLabel(windDirection),
      unit: '',
      subtext: 'Entrada na costa',
      subtextColor: 'text-slate-500',
      title: `Direção do vento: ${windDirLabel(windDirection)}`,
      ariaLabel: `Direção do vento: ${windDirLabel(windDirection)}`,
    },
    {
      icon: FaFlag,
      label: 'Escala Beaufort',
      value: `${beaufort}`,
      unit: `— ${beaufortDesc}`,
      subtext: kitesurf.label,
      subtextColor: kitesurf.textClass,
      title: `Escala Beaufort: ${beaufort} — ${beaufortDesc}`,
      ariaLabel: `Escala Beaufort: ${beaufort}, ${beaufortDesc}`,
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Condições do vento">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            role="listitem"
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-slate-700 transition-colors"
            title={card.title}
            aria-label={card.ariaLabel}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-sky-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-400">{card.label}</span>
            </div>
            <p className="text-3xl font-extrabold text-white">
              {card.value} <span className="text-sm font-normal text-slate-400">{card.unit}</span>
            </p>
            <p className={`text-[11px] font-medium ${card.subtextColor}`}>{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
