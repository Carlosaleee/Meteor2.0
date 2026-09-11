'use client';

import { FaWater, FaChartArea, FaMoon, FaMapMarkerAlt, FaNewspaper } from 'react-icons/fa';

type Tab = {
  id: string;
  label: string;
  icon: React.ElementType;
  tip: string;
};

const TABS: Tab[] = [
  { id: 'news', label: 'Notícias', icon: FaNewspaper, tip: 'Notícias de surf WSL, SPSurf e fontes locais' },
  { id: 'waves', label: 'Ondas', icon: FaChartArea, tip: 'Previsão horária de ondas com gráficos' },
  { id: 'spots', label: 'Picos', icon: FaMapMarkerAlt, tip: 'Mapa e cards dos picos de surf' },
  { id: 'tides', label: 'Marés', icon: FaMoon, tip: 'Tabla de marés alta e baixa' },
  { id: 'overview', label: 'Visão Geral', icon: FaWater, tip: 'Resumo das condições atuais de surf e mar' },
];

type SwellTabsProps = {
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export function SwellTabs({ activeTab, onTabChange }: SwellTabsProps) {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-5 gap-2" role="tablist" aria-label="Seções de swell">
      {TABS.map(tab => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            title={tab.tip}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              isActive
                ? 'bg-blue-500/20 text-blue-400 border border-blue-400 shadow-lg shadow-blue-500/10'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} aria-hidden="true" />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
