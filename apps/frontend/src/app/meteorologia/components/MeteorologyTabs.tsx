'use client';

import { meteorologia } from '@/i18n/dictionaries/meteorologia';
import { useDict } from '@/i18n/context';
import { useState } from 'react';
import { FaExclamationTriangle, FaCloudSun, FaSatellite, FaChartLine } from 'react-icons/fa';

const TABS = [
  { id: 'avisos', label: 'Avisos Meteorológicos', icon: FaExclamationTriangle, tip: 'Alertas ativos da Defesa Civil, INMET e Marinha para a região' },
  { id: 'previsao', label: 'Previsão de Tempo', icon: FaCloudSun, tip: 'Mapa, métricas, previsão horária e diária da cidade selecionada' },
  { id: 'satelite', label: 'Satélite', icon: FaSatellite, tip: 'Imagens de satélite em tempo real da costa paulista' },
  { id: 'numerica', label: 'Previsão Numérica', icon: FaChartLine, tip: 'Modelos GFS, ECMWF e COSMO-Brasil com radar RainViewer' },
];

type MeteorologyTabsProps = {
  children: (activeTab: string) => React.ReactNode;
};

export function MeteorologyTabs({ children }: MeteorologyTabsProps) {
  const t = useDict(meteorologia);
  const [activeTab, setActiveTab] = useState('previsao');

  return (
    <div className="space-y-5">
      {/* Tab Navigation */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2"
        role="tablist"
        aria-label={t['tabs.aria']}
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const tabId = `tab-${tab.id}`;
          const panelId = `panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              id={tabId}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              title={tab.tip}
              className={`
                flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset)]
                ${isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400 shadow-lg shadow-cyan-500/10'
                  : 'bg-card-2/60 text-card-muted border border-card-line/50 hover:bg-card-2 hover:text-card-text hover:border-card-line'
                }
              `}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-card-dim'}`} aria-hidden="true" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {children(activeTab)}
      </div>
    </div>
  );
}
