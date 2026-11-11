'use client';

import dynamic from 'next/dynamic';
import { FaInfoCircle } from 'react-icons/fa';
import type { HourlyMarinePoint } from '@/lib/api';
import { useDict } from '@/i18n/context';
import { swell } from '@/i18n/dictionaries/swell';
import { fmt } from '@/i18n/format';
import { useThemeMode } from '@/hooks/useThemeMode';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type WaveChartProps = {
  data: HourlyMarinePoint[];
};

/** Faixa de qualidade: `labelKey` traduz na exibicao, `label` e o fallback cru. */
function qualityBand(height: number): { labelKey: string; label: string; color: string } {
  if (height >= 1.5) return { labelKey: 'quality.classic', label: 'Clássico', color: '#f59e0b' };
  if (height >= 1.0) return { labelKey: 'quality.good', label: 'Boas', color: '#10b981' };
  if (height >= 0.5) return { labelKey: 'quality.small', label: 'Pequenas', color: '#3b82f6' };
  return { labelKey: 'quality.flat', label: 'Flat', color: '#64748b' };
}

export function WaveChart({ data }: WaveChartProps) {
  const mode = useThemeMode();
  const t = useDict(swell);
  const isLight = mode === 'light';
  const labelColor = isLight ? '#475569' : '#94a3b8';
  const titleColor = isLight ? '#475569' : '#64748b';
  const gridColor = isLight ? '#e2e8f0' : '#1e293b';

  const categories = data.map(d => {
    const h = new Date(d.time).getHours();
    return `${String(h).padStart(2, '0')}:00`;
  });

  const waveSeries = data.map(d => Number(d.waveHeight.toFixed(2)));
  const swellSeries = data.map(d => Number(d.swellHeight.toFixed(2)));
  const maxWave = Math.max(...waveSeries);
  const bestQuality = qualityBand(maxWave);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    colors: ['#3b82f6', '#06b6d4'],
    stroke: { width: [2, 2], curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories,
      labels: { style: { colors: labelColor, fontSize: '10px' }, rotate: -45, rotateAlways: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: t['wave.yAxis'], style: { color: titleColor, fontSize: '10px' } },
      labels: { style: { colors: labelColor, fontSize: '10px' }, formatter: v => `${v}m` },
      min: 0,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: labelColor, useSeriesColors: true },
    },
    tooltip: {
      theme: mode,
      shared: true,
      custom: ({ series, dataPointIndex }) => {
        const wave = series[0]?.[dataPointIndex] ?? 0;
        const swellVal = series[1]?.[dataPointIndex] ?? 0;
        const q = qualityBand(wave);
        const period = data[dataPointIndex]?.wavePeriod ?? 0;
        const dir = data[dataPointIndex]?.waveDirection ?? 0;
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const dirLabel = dirs[Math.round(dir / 45) % 8] ?? 'N';
        return `<div class="bg-card border border-card-line rounded-lg px-4 py-3 text-xs space-y-1">
          <div class="text-card-subtle font-medium">${categories[dataPointIndex]}</div>
          <div class="text-card-text font-bold">${fmt(t['wave.tipWave'], { value: wave, quality: t[q.labelKey] ?? q.label })}</div>
          <div class="text-cyan-400">${fmt(t['wave.tipSwell'], { value: swellVal })}</div>
          <div class="text-card-muted">${fmt(t['wave.tipPeriodDir'], { period, dir: dirLabel })}</div>
        </div>`;
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },
    dataLabels: { enabled: false },
    annotations: {
      yaxis: [
        { y: 1.5, borderColor: '#f59e0b', strokeDashArray: 4, label: { text: t['quality.classic'], style: { color: '#f59e0b', background: 'transparent', fontSize: '10px' } } },
        { y: 1.0, borderColor: '#10b981', strokeDashArray: 4, label: { text: t['quality.good'], style: { color: '#10b981', background: 'transparent', fontSize: '10px' } } },
      ],
    },
  };

  const series = [
    { name: t['wave.seriesWave'], data: waveSeries },
    { name: t['wave.seriesSwell'], data: swellSeries },
  ];

  return (
    <section className="bg-card/80 border border-card-border rounded-2xl p-5" aria-label={t['wave.sectionAria']}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-card-subtle uppercase tracking-wider">{t['wave.heading']}</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-card-dim" title={t['chart.dashTitle']}>
          <FaInfoCircle className="w-3 h-3" aria-hidden="true" />
          <span>{t['chart.dashLegend']}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mb-3 text-[10px]">
        <span className="text-card-muted">
          <span className="text-blue-400 font-medium">{t['wave.legendWaveName']}</span> {t['wave.legendWaveDesc']}
        </span>
        <span className="text-card-muted">
          <span className="text-cyan-400 font-medium">{t['wave.legendSwellName']}</span> {t['wave.legendSwellDesc']}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-card-dim">{t['chart.peak']}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${bestQuality.color}20`, color: bestQuality.color, border: `1px solid ${bestQuality.color}40` }}>
          {t[bestQuality.labelKey] ?? bestQuality.label} ({maxWave}m)
        </span>
      </div>
      <div className="w-full" style={{ height: '350px' }}>
        <Chart options={options} series={series} type="area" height="100%" width="100%" />
      </div>
    </section>
  );
}
