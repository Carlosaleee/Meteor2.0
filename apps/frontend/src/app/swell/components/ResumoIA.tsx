'use client';

import { FaRobot } from 'react-icons/fa';

type ResumoIAProps = {
  summary: string | null;
  loading: boolean;
  error: string | null;
};

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('🏄') || line.startsWith('🌬️') || line.startsWith('⏰') || line.startsWith('🏆') || line.startsWith('⚠️')) {
      return (
        <p key={i} className="text-sm font-bold text-white mt-3 mb-1">
          {line.replace(/\*\*(.*?)\*\*/g, '$1')}
        </p>
      );
    }
    if (line.startsWith('- ')) {
      return (
        <p key={i} className="text-sm text-slate-300 leading-relaxed ml-3">
          • {line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong class="text-white">${m}</strong>`).split(/(<strong.*?<\/strong>)/).map((part, j) => {
            if (part.startsWith('<strong')) {
              return <span key={j} className="text-white font-semibold" dangerouslySetInnerHTML={{ __html: part }} />;
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-1" />;
    return (
      <p key={i} className="text-sm text-slate-300 leading-relaxed">
        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
      </p>
    );
  });
}

export function ResumoIA({ summary, loading, error }: ResumoIAProps) {
  if (loading) {
    return (
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 animate-pulse" aria-label="Carregando resumo IA">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-800" />
          <div className="h-5 bg-slate-800 rounded w-48" />
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-4/5" />
          <div className="h-3 bg-slate-800 rounded w-3/5" />
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-2/3" />
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
          <h3 className="text-base font-semibold text-slate-400 uppercase tracking-wider">Briefing IA</h3>
        </div>
        <p className="text-sm text-slate-500">Resumo indisponível no momento.</p>
      </section>
    );
  }

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
          <h3 className="text-base font-semibold text-blue-300 uppercase tracking-wider">Briefing IA — Gemini Flash</h3>
          <p className="text-[10px] text-slate-500">Análise detalhada de condições de surf</p>
        </div>
      </div>
      <div
        className="space-y-0.5"
        title="Briefing tático gerado por inteligência artificial com base nos dados oceanográficos atuais"
        aria-live="polite"
      >
        {renderMarkdown(summary)}
      </div>
    </section>
  );
}
