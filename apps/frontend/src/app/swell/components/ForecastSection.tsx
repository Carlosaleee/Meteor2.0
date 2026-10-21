'use client';

import { type ReactNode } from 'react';
import { FaAnchor } from 'react-icons/fa';

type ForecastSectionProps = {
  id: string;
  title: string;
  icon?: ReactNode;
  ariaLabel: string;
  /** Acao/CTA alinhada a direita no header (ex.: link para a aba correspondente). */
  action?: ReactNode;
  /** Reflete estado de carregamento na regiao (aria-busy). */
  ariaBusy?: boolean;
  children: ReactNode;
};

export function ForecastSection({ id, title, icon, ariaLabel, action, ariaBusy, children }: ForecastSectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-busy={ariaBusy}
      className="scroll-mt-20 group"
    >
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 rounded-lg group-focus-within:ring-2 group-focus-within:ring-cyan-500/50 group-focus-within:ring-offset-2 group-focus-within:ring-offset-transparent">
        {icon ?? <FaAnchor className="w-5 h-5 text-cyan-400" aria-hidden="true" />}
        {title}
        {action && <span className="ml-auto">{action}</span>}
      </h2>
      {children}
    </section>
  );
}
