'use client';

import dynamic from 'next/dynamic';
import { FaInfoCircle } from 'react-icons/fa';
import type { HourlyMarinePoint } from '@/lib/api';
import { windQuality, windDir, beaufortScale } from './windUtils';
import { useDict } from '@/i18n/context';
import { swell } from '@/i18n/dictionaries/swell';
import { fmt } from '@/i18n/format';
import { useThemeMode } from '@/hooks/useThemeMode';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type WindChartProps = {
  data: HourlyMarinePoint[];
};

export function WindChart({ data }: WindChartProps) {
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

  const speedSeries = data.map(d => Number(d.windSpeed.toFixed(1)));
  const gustSeries = data.map(d => Number(d.windGust.toFixed(1)));
  const maxSpeed = Math.max(...speedSeries);
  const maxGust = Math.max(...gustSeries);
  const bestQuality = windQuality(maxSpeed);
  const maxBeaufort = beaufortScale(maxSpeed);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    colors: ['#0ea5e9', '#f97316'],
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
      title: { text: t['windc.yAxis'], style: { color: titleColor, fontSize: '10px' } },
      labels: { style: { colors: labelColor, fontSize: '10px' }, formatter: v => `${v}` },
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
        const speed = series[0]?.[dataPointIndex] ?? 0;
        const gust = series[1]?.[dataPointIndex] ?? 0;
        const dir = data[dataPointIndex]?.windDirection ?? 0;
        const q = windQuality(speed);
        const dirLabel = windDir(dir);
        return `<div class="bg-card border border-card-line rounded-lg px-4 py-3 text-xs space-y-1">
          <div class="text-card-subtle font-medium">${categories[dataPointIndex]}</div>
          <div class="text-card-text font-bold">${fmt(t['windc.tipSpeed'], { value: speed })} <span style="color:${q.color}">(${t[q.labelKey] ?? q.label})</span></div>
          <div class="text-orange-400">${fmt(t['windc.tipGust'], { value: gust })}</div>
          <div class="text-card-muted">${fmt(t['windc.tipDir'], { dir: dirLabel, deg: dir })}</div>
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
        { y: 12, borderColor: '#06b6d4', strokeDashArray: 4, label: { text: t['windc.annSurf'], style: { color: '#06b6d4', background: 'transparent', fontSize: '10px' } } },
        { y: 20, borderColor: '#10b981', strokeDashArray: 4, label: { text: t['windc.annKite'], style: { color: '#10b981', background: 'transparent', fontSize: '10px' } } },
        { y: 30, borderColor: '#f59e0b', strokeDashArray: 4, label: { text: t['windc.annDanger'], style: { color: '#f59e0b', background: 'transparent', fontSize: '10px' } } },
      ],
    },
  };

  const series = [
    { name: t['windc.seriesSpeed'], data: speedSeries },
    { name: t['windc.seriesGust'], data: gustSeries },
  ];

  return (
    <section className="bg-card/80 border border-card-border rounded-2xl p-5" aria-label={t['windc.sectionAria']}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-card-subtle uppercase tracking-wider">{t['windc.heading']}</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-card-dim" title={t['chart.dashTitle']}>
          <FaInfoCircle className="w-3 h-3" aria-hidden="true" />
          <span>{t['chart.dashLegend']}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mb-3 text-[10px]">
        <span className="text-card-muted">
          <span className="text-sky-400 font-medium">{t['windc.legendSpeedName']}</span> {t['windc.legendSpeedDesc']}
        </span>
        <span className="text-card-muted">
          <span className="text-orange-400 font-medium">{t['windc.legendGustName']}</span> {t['windc.legendGustDesc']}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-[10px] text-card-dim">{t['chart.peak']}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${bestQuality.color}20`, color: bestQuality.color, border: `1px solid ${bestQuality.color}40` }}>
          {t[bestQuality.labelKey] ?? bestQuality.label} ({maxSpeed} km/h)
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-card-line/50 text-card-subtle border border-card-line/50">
          {fmt(t['windc.beaufort'], { value: maxBeaufort })}
        </span>
        {maxGust > maxSpeed * 1.3 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {fmt(t['windc.gustStrong'], { value: maxGust })}
          </span>
        )}
      </div>
      <div className="w-full" style={{ height: '350px' }}>
        <Chart options={options} series={series} type="area" height="100%" width="100%" />
      </div>
    </section>
  );
}
