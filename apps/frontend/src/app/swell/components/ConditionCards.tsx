'use client';

import { FaWater, FaCompass, FaClock, FaStar, FaArrowUp } from 'react-icons/fa';
import { useDict } from '@/i18n/context';
import { common } from '@/i18n/dictionaries/common';
import { fmt } from '@/i18n/format';

type ConditionCardsProps = {
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
  qualityLabel: string;
  qualityEmoji: string;
};

function waveDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

/** Compara o valor BRUTO do prop (chega do backend em PT) — nunca a tradução. */
function qualityColor(label: string): string {
  if (label === 'Clássico!') return 'text-amber-400';
  if (label === 'Boas') return 'text-emerald-400';
  if (label === 'Pequenas') return 'text-blue-400';
  return 'text-card-dim';
}

/** Lookup exibição → chave de dicionário; valor cru fora do mapa (fallback). */
const QUALITY_KEYS: Record<string, string> = {
  'Clássico!': 'card.quality.classic',
  'Clássico': 'card.quality.classicPlain',
  'Boas': 'card.quality.good',
  'Pequenas': 'card.quality.small',
  'Bom': 'card.quality.ok',
};

export function ConditionCards({ waveHeight, wavePeriod, waveDirection, swellHeight, qualityLabel, qualityEmoji }: ConditionCardsProps) {
  const t = useDict(common);
  const dir = waveDir(waveDirection);
  const qualityKey = QUALITY_KEYS[qualityLabel];
  const qualityText = qualityKey ? t[qualityKey] : qualityLabel;

  return (
    <section className="bg-card/80 border border-card-border rounded-2xl p-4" aria-label={t['card.section.aria']}>
      <h3 className="text-sm font-semibold text-card-subtle mb-3 uppercase tracking-wider">{t['card.title']}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <div
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-card-2/60 border border-card-line/50 hover:border-blue-500/30 transition-colors"
          title={fmt(t['card.wave.title'], { h: waveHeight })}
          aria-label={fmt(t['card.wave.title'], { h: waveHeight })}
        >
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <FaWater className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-card-text tabular-nums">{waveHeight}m</span>
          <span className="text-[9px] text-card-muted">{t['card.wave.label']}</span>
        </div>

        <div
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-card-2/60 border border-card-line/50 hover:border-cyan-500/30 transition-colors"
          title={fmt(t['card.swell.title'], { h: swellHeight })}
          aria-label={fmt(t['card.swell.title'], { h: swellHeight })}
        >
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <FaArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-card-text tabular-nums">{swellHeight}m</span>
          <span className="text-[9px] text-card-muted">{t['card.swell.label']}</span>
        </div>

        <div
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-card-2/60 border border-card-line/50 hover:border-rose-500/30 transition-colors"
          title={fmt(t['card.period.title'], { p: wavePeriod })}
          aria-label={fmt(t['card.period.title'], { p: wavePeriod })}
        >
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
            <FaClock className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-card-text tabular-nums">{wavePeriod}s</span>
          <span className="text-[9px] text-card-muted">{t['card.period.label']}</span>
        </div>

        <div
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-card-2/60 border border-card-line/50 hover:border-emerald-500/30 transition-colors"
          title={fmt(t['card.direction.title'], { deg: waveDirection, dir })}
          aria-label={fmt(t['card.direction.aria'], { dir })}
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <FaCompass className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-card-text">{dir}</span>
          <span className="text-[9px] text-card-muted">{t['card.direction.label']}</span>
        </div>

        <div
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-card-2/60 border border-card-line/50 hover:border-amber-500/30 transition-colors col-span-2 sm:col-span-1"
          title={fmt(t['card.quality.title'], { label: qualityText })}
          aria-label={fmt(t['card.quality.title'], { label: qualityText })}
        >
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <FaStar className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-lg" aria-hidden="true">{qualityEmoji}</span>
          <span className={`text-sm font-bold ${qualityColor(qualityLabel)}`}>{qualityText}</span>
        </div>
      </div>
    </section>
  );
}
