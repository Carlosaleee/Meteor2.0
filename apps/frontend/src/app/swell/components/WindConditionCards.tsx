'use client';

import { FaWind, FaArrowUp, FaCompass, FaFlag, FaStar } from 'react-icons/fa';
import { windQuality, windDir, beaufortScale, beaufortDescription, kitesurfWindQuality, surfWindQuality } from './windUtils';

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
  const surf = surfWindQuality(windSpeed, windDirection, 'Leste');
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
      label: 'Beaufort',
      value: `${beaufort}`,
      unit: `— ${beaufortDesc}`,
      subtext: kitesurf.label,
      subtextColor: kitesurf.textClass,
      title: `Escala Beaufort: ${beaufort} — ${beaufortDesc}`,
      ariaLabel: `Escala Beaufort: ${beaufort}, ${beaufortDesc}`,
    },
    {
      icon: FaStar,
      label: 'Qualidade Surf',
      value: surf.label,
      unit: '',
      subtext: surf.label.includes('Offshore') ? 'Vento favorável' : surf.label.includes('Onshore') ? 'Vento desfavorável' : 'Condição neutra',
      subtextColor: surf.textClass,
      title: `Qualidade do vento para surf: ${surf.label}`,
      ariaLabel: `Qualidade do vento para surf: ${surf.label}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" role="list" aria-label="Condições do vento">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            role="listitem"
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-sky-500/30 transition-colors"
            title={card.title}
            aria-label={card.ariaLabel}
          >
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-white tabular-nums">{card.value}</span>
            {card.unit && <span className="text-[10px] text-slate-400">{card.unit}</span>}
            <span className={`text-[10px] font-medium ${card.subtextColor}`}>{card.subtext}</span>
          </div>
        );
      })}
    </div>
  );
}
