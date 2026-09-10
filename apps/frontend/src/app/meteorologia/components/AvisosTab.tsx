'use client';

import { FaExclamationTriangle, FaShieldAlt, FaInfoCircle, FaExternalLinkAlt } from 'react-icons/fa';

const ALERTS = [
  {
    id: 1,
    level: 'moderate',
    title: 'Alerta de Temporal Costeiro',
    source: 'Defesa Civil de SP',
    time: '10/09/2026 08:00',
    description: 'Possibilidade de ventos fortes e mar agitado no litoral sul. Evite praias expostas.',
    regions: ['Ilha Comprida', 'Cananéia'],
    url: 'https://www.defesacivil.sp.gov.br/',
  },
  {
    id: 2,
    level: 'low',
    title: 'Monitoramento de Chuvas',
    source: 'INMET',
    time: '10/09/2026 06:00',
    description: 'Precipitação acumulada de 20-40mm esperada nos próximos 24h. Sem risco de inundação.',
    regions: ['Vale do Ribeira', 'Litoral Sul'],
    url: 'https://avisos.inmet.gov.br/',
  },
  {
    id: 3,
    level: 'info',
    title: 'Boletim Maré Baixa',
    source: 'Marinha do Brasil',
    time: '10/09/2026 05:30',
    description: 'Maré baixa prevista para às 14h22. Coleta de moluscos autorizada.',
    regions: ['Todos os municípios'],
    url: 'https://www.marinha.mil.br/',
  },
];

const LEVEL_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-400' },
  moderate: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  low: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
  info: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', icon: 'text-slate-400' },
};

export function AvisosTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Central de Avisos Meteorológicos</h3>
            <p className="text-xs text-slate-400">
              Fontes oficiais: Defesa Civil de SP, INMET, Marinha do Brasil. Dados em tempo real.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3" role="list" aria-label="Lista de alertas meteorológicos">
        {ALERTS.map(alert => {
          const style = LEVEL_STYLES[alert.level] ?? LEVEL_STYLES.info;
          const levelLabel = alert.level === 'high' ? 'ALTO' : alert.level === 'moderate' ? 'MODERADO' : alert.level === 'low' ? 'BAIXO' : 'INFO';
          return (
            <a
              key={alert.id}
              href={alert.url}
              target="_blank"
              rel="noopener noreferrer"
              role="listitem"
              aria-label={`${levelLabel}: ${alert.title}. ${alert.description}. Fonte: ${alert.source}`}
              className={`block ${style.bg} border ${style.border} rounded-2xl p-5 hover:scale-[1.005] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400`}
            >
              <div className="flex items-start gap-3">
                <FaShieldAlt className={`w-5 h-5 ${style.icon} mt-0.5 flex-shrink-0`} aria-hidden="true" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-semibold ${style.text}`}>{alert.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`} aria-hidden="true">
                      {levelLabel}
                    </span>
                    <FaExternalLinkAlt className="w-3 h-3 text-slate-600 ml-auto" aria-hidden="true" />
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500">
                    <span>Fonte: <span className={style.text}>{alert.source}</span></span>
                    <span>Regiões: {alert.regions.join(', ')}</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Info box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Guia de interpretação dos níveis de alerta">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="text-xs text-slate-500 leading-relaxed">
            <p className="mb-1">
              <strong className="text-slate-400">Como interpretar:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong className="text-red-400">ALTO</strong> — Risco iminente. Evacue se necessário.</li>
              <li><strong className="text-amber-400">MODERADO</strong> — Possibilidade de impacto. Mantenha atenção.</li>
              <li><strong className="text-cyan-400">BAIXO</strong> — Monitoramento preventivo. Sem ação urgente.</li>
              <li><strong className="text-slate-400">INFO</strong> — Informação de serviço. Sem risco.</li>
            </ul>
            <p className="mt-3 text-[10px] text-slate-600">
              Dados: <a href="https://portal.inmet.gov.br/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400">INMET</a> · <a href="https://www.defesacivil.sp.gov.br/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400">Defesa Civil SP</a> · <a href="https://www.cptec.inpe.br/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400">CPTEC/INPE</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
