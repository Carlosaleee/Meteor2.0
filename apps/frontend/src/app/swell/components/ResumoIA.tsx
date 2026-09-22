'use client';

import { FaRobot } from 'react-icons/fa';

type BriefingCard = {
  emoji: string;
  title: string;
  value: string;
  detail: string;
  color: string;
};

type ResumoIAProps = {
  summary: string | null;
  loading: boolean;
  error: string | null;
};

function parseCardsFromSummary(summary: string): BriefingCard[] {
  const cards: BriefingCard[] = [];

  const waveMatch = summary.match(/Altura atual:\s*([\d.]+)m/i);
  const periodMatch = summary.match(/Período:\s*([\d.]+)s/i);
  const qualityMatch = summary.match(/Qualidade[:\s]*(.*?)(?:\n|$)/i);

  if (waveMatch || periodMatch) {
    cards.push({
      emoji: '🏄',
      title: 'Ondas',
      value: `${waveMatch?.[1] ?? '?'}m / ${periodMatch?.[1] ?? '?'}s`,
      detail: qualityMatch?.[1]?.trim() ?? 'Condições de surf',
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    });
  }

  const windSpeedMatch = summary.match(/Velocidade:\s*([\d.]+)\s*km\/h/i);
  const windTypeMatch = summary.match(/Tipo:\s*(.*?)(?:\n|$)/i);

  if (windSpeedMatch) {
    cards.push({
      emoji: '🌬️',
      title: 'Vento',
      value: `${windSpeedMatch[1]} km/h`,
      detail: windTypeMatch?.[1]?.trim() ?? 'Condições de vento',
      color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
    });
  }

  const kiteMatch = summary.match(/Condições de vento:\s*(.*?)(?:\n|$)/i);
  const kiteSpeedMatch = summary.match(/Vento atual:\s*([\d.]+)\s*km\/h\s*—\s*(.*?)(?:\n|$)/i);

  if (kiteMatch) {
    cards.push({
      emoji: '🪁',
      title: 'Kite / Wind',
      value: kiteSpeedMatch ? `${kiteSpeedMatch[1]} km/h` : kiteMatch[1],
      detail: kiteSpeedMatch?.[2]?.trim() ?? 'Avaliação',
      color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    });
  }

  const bestTimeMatch = summary.match(/Janela ideal.*?:\s*(.*?)(?:\n|$)/i);

  if (bestTimeMatch) {
    cards.push({
      emoji: '⏰',
      title: 'Horários',
      value: bestTimeMatch[1].trim(),
      detail: 'Janela ideal para surf',
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    });
  }

  const spotMatch = summary.match(/Recomendação principal.*?:\s*(.*?)(?:\n|$)/i);

  if (spotMatch) {
    cards.push({
      emoji: '🏆',
      title: 'Points',
      value: spotMatch[1].trim(),
      detail: 'Spot recomendado',
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    });
  }

  const tideMatch = summary.match(/Próxima maré:\s*(.*?)(?:\n|$)/i);
  const coeffMatch = summary.match(/Coeficiente:\s*(.*?)(?:\n|$)/i);

  if (tideMatch) {
    cards.push({
      emoji: '⚠️',
      title: 'Alertas',
      value: tideMatch[1].trim(),
      detail: coeffMatch ? `Coef: ${coeffMatch[1].trim()}` : 'Atenção',
      color: 'from-red-500/20 to-red-600/10 border-red-500/30',
    });
  }

  return cards;
}

function renderBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (/^[🎳🌬️🪁⏰🏆⚠️]/.test(line)) {
      return (
        <p key={i} className="text-sm font-bold text-white mt-3 mb-1">
          {renderBold(line)}
        </p>
      );
    }
    if (line.startsWith('- ')) {
      return (
        <p key={i} className="text-sm text-slate-300 leading-relaxed ml-3">
          • {renderBold(line.slice(2))}
        </p>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-1" />;
    return (
      <p key={i} className="text-sm text-slate-300 leading-relaxed">
        {renderBold(line)}
      </p>
    );
  });
}

function BriefingCardComponent({ card }: { card: BriefingCard }) {
  return (
    <div className={`rounded-xl border p-3 bg-gradient-to-br ${card.color} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base" aria-hidden="true">{card.emoji}</span>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{card.title}</span>
      </div>
      <p className="text-sm font-bold text-white leading-tight">{card.value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{card.detail}</p>
    </div>
  );
}

function splitIntoColumns(text: string): [string[], string[]] {
  const sections = text.split(/(?=^[\u{1F3BF}\u{1F32C}\u{1FA81}\u{23F0}\u{1F3C6}\u{26A0}])/mu);
  const mid = Math.ceil(sections.length / 2);
  const left = sections.slice(0, mid).filter(s => s.trim());
  const right = sections.slice(mid).filter(s => s.trim());
  return [left, right];
}

export function ResumoIA({ summary, loading, error }: ResumoIAProps) {
  if (loading) {
    return (
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 animate-pulse" aria-label="Carregando resumo IA">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-800" />
          <div className="h-5 bg-slate-800 rounded w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-4/5" />
            <div className="h-3 bg-slate-800 rounded w-3/5" />
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-2/3" />
            <div className="h-3 bg-slate-800 rounded w-4/5" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6" aria-label="Resumo IA indisponível">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-500">
            <FaRobot className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-slate-400 uppercase tracking-wider">Briefing Tático IA</h3>
        </div>
        <p className="text-sm text-slate-500">Resumo indisponível no momento.</p>
      </section>
    );
  }

  const cards = parseCardsFromSummary(summary);
  const [leftSections, rightSections] = splitIntoColumns(summary);

  return (
    <section
      className="bg-gradient-to-br from-blue-900/40 via-slate-900/80 to-slate-900/80 border border-blue-800/40 rounded-2xl p-6"
      aria-label="Briefing tático gerado por IA"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
          <FaRobot className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-blue-300 uppercase tracking-wider">Briefing Tático IA</h3>
          <p className="text-[10px] text-slate-500">Análise de condições de surf e clima</p>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {cards.map((card, i) => (
            <BriefingCardComponent key={i} card={card} />
          ))}
        </div>
      )}

      <div
        className="grid lg:grid-cols-2 gap-x-8 gap-y-1"
        title="Briefing tático gerado por inteligência artificial com base nos dados oceanográficos atuais"
        aria-live="polite"
      >
        <div className="space-y-0.5">
          {leftSections.map((section) => renderMarkdown(section))}
        </div>
        <div className="space-y-0.5">
          {rightSections.map((section) => renderMarkdown(section))}
        </div>
      </div>
    </section>
  );
}
