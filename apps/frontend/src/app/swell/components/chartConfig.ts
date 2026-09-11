export const CHART_COLORS = {
  blue: '#3b82f6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  sky: '#0ea5e9',
  orange: '#f97316',
} as const;

export const BASE_CHART_CONFIG = {
  chart: {
    background: 'transparent',
    toolbar: { show: false },
    fontFamily: 'inherit',
    animations: {
      enabled: true,
      easing: 'easeinout' as const,
      speed: 800,
    },
  },
  grid: {
    borderColor: '#334155',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { top: -20, bottom: -10 },
  },
  xaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '10px' },
      datetimeFormatter: { hour: 'HH:mm' },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
    crosshairs: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '10px' },
    },
  },
  tooltip: {
    theme: 'dark' as const,
    style: { fontSize: '12px' },
    x: {
      show: true,
      format: 'HH:mm',
    },
  },
  stroke: {
    curve: 'smooth' as const,
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: true,
    position: 'top' as const,
    horizontalAlign: 'right' as const,
    labels: { colors: '#94a3b8' },
    fontSize: '11px',
  },
} as const;

export const AREA_CHART_DEFAULTS = {
  type: 'area' as const,
  height: 300,
  sparkline: { enabled: false },
  zoom: { enabled: false },
};

export const LINE_CHART_DEFAULTS = {
  type: 'line' as const,
  height: 300,
  sparkline: { enabled: false },
  zoom: { enabled: false },
};
