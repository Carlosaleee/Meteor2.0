'use client';

import { FaLightbulb } from 'react-icons/fa';

type DailyTipProps = {
  waveHeight: number;
  wavePeriod: number;
  qualityLabel: string;
  bestTime: string;
};

export function DailyTip({ waveHeight, wavePeriod, qualityLabel, bestTime }: DailyTipProps) {
  let tip = '';
  let board = '';

  if (waveHeight < 0.5) {
    tip = 'Dia de flat! Aproveite para dar um pausa ou praticar SUP na calmaria. Ondas menores que 0.5m são ideais para iniciantes absolutos.';
    board = 'SUP ou longboard';
  } else if (waveHeight < 1.0) {
    tip = `Ondas pequenas de ${waveHeight}m, perfeitas para quem está começando. Foque na técnica de remada e na leitura da praia. Período de ${wavePeriod}s é razoável.`;
    board = 'Longboard (8\'0"+)';
  } else if (waveHeight < 1.5) {
    tip = `Boas condições! Ondas de ${waveHeight}m com período de ${wavePeriod}s. Momento ideal para intermediários. Aproveite a janela das ${bestTime} quando o vento está mais favorável.`;
    board = 'Fish ou Hybrida (6\'0" - 6\'4")';
  } else if (waveHeight < 2.0) {
    tip = `Ondas de ${waveHeight}m! Dia para surfistas com experiência. Período de ${wavePeriod}s indica boa formação. Cuidado com correntes de retorno. Use a janela das ${bestTime}.`;
    board = 'Shortboard (5\'8" - 6\'2")';
  } else {
    tip = `Dia de ondas grandes! ${waveHeight}m com período de ${wavePeriod}s. Apenas para avançados. Verifique as condições na praia antes de entrar. Never surf alone.`;
    board = 'Gun (6\'6"+)';
  }

  return (
    <section
      className="bg-gradient-to-br from-amber-900/20 via-slate-900/80 to-slate-900/80 border border-amber-800/30 rounded-2xl p-5"
      aria-label="Dica do dia para surf"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
          <FaLightbulb className="w-4 h-4" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">Dica do Dia</h3>
      </div>
      <p
        className="text-sm text-slate-300 leading-relaxed mb-3"
        title="Dica prática de surf baseada nas condições atuais"
        aria-live="polite"
      >
        {tip}
      </p>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">Prancha recomendada:</span>
        <span className="text-amber-400 font-medium">{board}</span>
      </div>
    </section>
  );
}
