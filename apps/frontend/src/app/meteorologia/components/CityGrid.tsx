'use client';

import { FaNewspaper, FaMapMarkerAlt, FaCalendarAlt, FaExternalLinkAlt } from 'react-icons/fa';

const NEWS_BY_CITY: Record<string, Array<{ title: string; date: string; source: string; type: 'alerta' | 'informe' | 'boletim'; url: string }>> = {
  'ilha-comprida': [
    { title: 'Avisos meteorológicos ativos para o litoral sul de SP', date: '10/09/2026', source: 'INMET', type: 'alerta', url: 'https://avisos.inmet.gov.br/' },
    { title: 'Previsão do tempo para Ilha Comprida — Próximos 7 dias', date: '10/09/2026', source: 'CPTEC/INPE', type: 'boletim', url: 'https://www.cptec.inpe.br/' },
  ],
  'iguape': [
    { title: 'Monitoramento de cheias no rio Iguape e estuário', date: '10/09/2026', source: 'Defesa Civil SP', type: 'informe', url: 'https://www.defesacivil.sp.gov.br/' },
    { title: 'Condições meteorológicas para Iguape — Boletim diário', date: '10/09/2026', source: 'INMET', type: 'boletim', url: 'https://portal.inmet.gov.br/' },
  ],
  'cananeia': [
    { title: 'Alerta de tempo severo para o litoral sul paulista', date: '10/09/2026', source: 'INMET', type: 'alerta', url: 'https://avisos.inmet.gov.br/' },
    { title: 'Previsão numérica para Cananéia — Modelo COSMO', date: '10/09/2026', source: 'CPTEC/INPE', type: 'boletim', url: 'https://previsaonumerica.cptec.inpe.br/' },
  ],
  'registro': [
    { title: 'Boletim climático do Vale do Ribeira — Setembro 2026', date: '10/09/2026', source: 'INMET', type: 'boletim', url: 'https://portal.inmet.gov.br/noticias/noticias' },
    { title: 'Defesa Civil mantém monitoramento preventivo na região', date: '09/09/2026', source: 'Defesa Civil SP', type: 'informe', url: 'https://www.defesacivil.sp.gov.br/' },
  ],
};

const CITY_META: Record<string, { name: string; region: string; state: string }> = {
  'ilha-comprida': { name: 'Ilha Comprida', region: 'Litoral Sul', state: 'SP' },
  'iguape': { name: 'Iguape', region: 'Vale do Ribeira', state: 'SP' },
  'cananeia': { name: 'Cananéia', region: 'Litoral Sul', state: 'SP' },
  'registro': { name: 'Registro', region: 'Vale do Ribeira', state: 'SP' },
};

const TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  alerta: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  informe: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  boletim: { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-400' },
};

type CityGridProps = {
  onSelectLocation: (id: string) => void;
};

export function CityGrid({ onSelectLocation }: CityGridProps) {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Notícias meteorológicas por cidade">
      <div className="flex items-center gap-2 mb-4">
        <FaNewspaper className="w-4 h-4 text-cyan-400" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Notícias Meteorológicas</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list">
        {Object.entries(NEWS_BY_CITY).map(([cityId, news]) => {
          const meta = CITY_META[cityId];
          return (
            <div
              key={cityId}
              role="listitem"
              className="group bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/30 hover:bg-slate-800/80 transition-all"
            >
              {/* Header do card */}
              <div className="flex items-center gap-2 mb-3">
                <FaMapMarkerAlt className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{meta?.name ?? cityId}</h4>
                  <p className="text-[10px] text-slate-500">{meta?.region} · {meta?.state}</p>
                </div>
              </div>

              {/* Lista de notícias */}
              <div className="space-y-2.5">
                {news.map((item, i) => {
                  const style = TYPE_STYLES[item.type] ?? TYPE_STYLES.boletim;
                  return (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block rounded-lg p-2.5 ${style.bg} border border-transparent hover:border-slate-700/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400`}
                      aria-label={`${item.title} — ${item.source}, ${item.date}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${style.dot}`} aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-200 leading-snug line-clamp-2">{item.title}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <FaCalendarAlt className="w-2.5 h-2.5 text-slate-500" aria-hidden="true" />
                            <span className="text-[10px] text-slate-500">{item.date}</span>
                            <span className="text-[10px] text-slate-600">·</span>
                            <span className={`text-[10px] font-medium ${style.text}`}>{item.source}</span>
                            <FaExternalLinkAlt className="w-2 h-2 text-slate-600 ml-auto" aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Botão selecionar */}
              <button
                onClick={() => onSelectLocation(cityId)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label={`Selecionar ${meta?.name ?? cityId} para ver previsão`}
              >
                <FaMapMarkerAlt className="w-3 h-3" aria-hidden="true" />
                Selecionar cidade
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
