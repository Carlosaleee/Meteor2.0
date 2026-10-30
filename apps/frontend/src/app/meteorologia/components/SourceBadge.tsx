'use client';

import type { MeteorologyResponse } from '@/lib/api';

type Props = {
  data?: MeteorologyResponse;
};

const STYLES: Record<string, { label: string; className: string; title: string }> = {
  live: {
    label: 'Previsão atualizada',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    title: 'Dados coletados da API do Open-Meteo — previsão de modelo, não observação de estação',
  },
  stale: {
    label: 'Dados desatualizados',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    title: 'Fonte indisponível — exibindo o último conteúdo coletado (ver horário ao lado)',
  },
  sample: {
    label: 'Dados de exemplo',
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    title: 'Conteúdo sintético determinístico — não representa condições reais',
  },
};

/**
 * Badge de proveniencia do dado meteorologico (MET-01/MET-03):
 * distingue previsao fresca, fallback antigo e conteudo sintetico.
 */
export function SourceBadge({ data }: Props) {
  const source = data?.source ?? 'live';
  const style = STYLES[source] ?? STYLES.live;
  const kind = data?.meta?.dataKind === 'sample' ? 'Sintético' : 'Previsão (modelo)';

  const coleta = data?.fetchedAt ?? null;
  const hora = coleta
    ? new Date(coleta).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null;
  const idadeHoras = data?.ageHours;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2" aria-live="polite">
      <span
        className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${style.className}`}
        title={style.title}
        data-testid="source-badge"
      >
        {style.label}
      </span>
      <span
        className="px-2 py-0.5 rounded-full border bg-slate-500/10 text-slate-400 border-slate-500/30 text-[10px] font-medium"
        title={`Natureza do dado: ${kind}${data?.meta?.provider ? ` — ${data.meta.provider}` : ''}${data?.meta?.model ? ` (${data.meta.model})` : ''}`}
      >
        {kind}
      </span>
      <span
        className="text-[10px] text-slate-500 tabular-nums"
        title={coleta ? 'Quando o backend coletou este conteúdo da fonte' : 'Sem registro de coleta (cache antigo)'}
      >
        Coleta: {hora ?? '--'}
        {typeof idadeHoras === 'number' && idadeHoras >= 0 ? ` (${idadeHoras}h)` : ''}
      </span>
    </div>
  );
}
