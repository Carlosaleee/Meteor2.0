'use client';

import { swell } from '@/i18n/dictionaries/swell';
import { useDict } from '@/i18n/context';
import { FaWater, FaWind, FaMapMarkerAlt, FaNewspaper, FaThLarge } from 'react-icons/fa';
import { type SwellTab } from '../tabs';

type Tab = {
  id: SwellTab;
  label: string;
  icon: React.ElementType;
  tip: string;
};

const TABS: Tab[] = [
  { id: 'overview', label: 'Visão Geral', icon: FaThLarge, tip: 'Resumo de condições, notícias, points e ventos' },
  { id: 'news', label: 'Notícias', icon: FaNewspaper, tip: 'Notícias de surf WSL, SPSurf e fontes locais' },
  { id: 'forecast', label: 'Previsão de Ondas', icon: FaWater, tip: 'Condições, gráfico, marés e resumo IA' },
  { id: 'wind', label: 'Previsão de Ventos', icon: FaWind, tip: 'Velocidade, rajada e direção do vento para kitesurf e windsurf' },
  { id: 'spots', label: 'Points', icon: FaMapMarkerAlt, tip: 'Mapa e cards dos points de surf' },
];

type SwellTabsProps = {
  activeTab: SwellTab;
  onTabChange: (tabId: SwellTab) => void;
};

export function SwellTabs({ activeTab, onTabChange }: SwellTabsProps) {
  const t = useDict(swell);
  return (
    <div className="grid grid-cols-3 lg:grid-cols-5 gap-2" role="tablist" aria-label={t['tabs.listAria']}>
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
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset)] ${
              isActive
                ? 'bg-blue-500/20 text-blue-400 border border-blue-400 shadow-lg shadow-blue-500/10'
                : 'bg-card-2/60 text-card-muted border border-card-line/50 hover:bg-card-2 hover:text-card-text hover:border-card-line'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-card-dim'}`} aria-hidden="true" />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
