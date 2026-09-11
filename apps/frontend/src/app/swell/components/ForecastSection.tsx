'use client';

import { type ReactNode } from 'react';
import { FaAnchor } from 'react-icons/fa';

type ForecastSectionProps = {
  id: string;
  title: string;
  icon?: ReactNode;
  ariaLabel: string;
  children: ReactNode;
};

export function ForecastSection({ id, title, icon, ariaLabel, children }: ForecastSectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className="scroll-mt-20"
    >
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        {icon ?? <FaAnchor className="w-5 h-5 text-cyan-400" aria-hidden="true" />}
        {title}
      </h2>
      {children}
    </section>
  );
}
