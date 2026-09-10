'use client';

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
  const [activeTab, setActiveTab] = useState('previsao');

  return (
    <div className="space-y-5">
      {/* Tab Navigation */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2"
        role="tablist"
        aria-label="Seções de meteorologia"
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
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                ${isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600'
                }
              `}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} aria-hidden="true" />
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
