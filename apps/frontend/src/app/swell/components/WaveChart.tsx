'use client';

import dynamic from 'next/dynamic';
import { FaInfoCircle } from 'react-icons/fa';
import type { HourlyMarinePoint } from '@/lib/api';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type WaveChartProps = {
  data: HourlyMarinePoint[];
};

function qualityBand(height: number): { label: string; color: string } {
  if (height >= 1.5) return { label: 'Clássico', color: '#f59e0b' };
  if (height >= 1.0) return { label: 'Boas', color: '#10b981' };
  if (height >= 0.5) return { label: 'Pequenas', color: '#3b82f6' };
  return { label: 'Flat', color: '#64748b' };
}

export function WaveChart({ data }: WaveChartProps) {
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
      labels: { style: { colors: '#94a3b8', fontSize: '10px' }, rotate: -45, rotateAlways: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: 'Metros (m)', style: { color: '#64748b', fontSize: '10px' } },
      labels: { style: { colors: '#94a3b8', fontSize: '10px' }, formatter: v => `${v}m` },
      min: 0,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#94a3b8', useSeriesColors: true },
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const wave = series[0]?.[dataPointIndex] ?? 0;
        const swell = series[1]?.[dataPointIndex] ?? 0;
        const q = qualityBand(wave);
        const period = data[dataPointIndex]?.wavePeriod ?? 0;
        const dir = data[dataPointIndex]?.waveDirection ?? 0;
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const dirLabel = dirs[Math.round(dir / 45) % 8] ?? 'N';
        return `<div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-xs space-y-1">
          <div class="text-slate-300 font-medium">${categories[dataPointIndex]}</div>
          <div class="text-white font-bold">Onda: ${wave}m <span style="color:${q.color}">(${q.label})</span></div>
          <div class="text-cyan-400">Swell: ${swell}m</div>
          <div class="text-slate-400">Período: ${period}s · Direção: ${dirLabel}</div>
        </div>`;
      },
    },
    grid: {
      borderColor: '#1e293b',
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },
    dataLabels: { enabled: false },
    annotations: {
      yaxis: [
        { y: 1.5, borderColor: '#f59e0b', strokeDashArray: 4, label: { text: 'Clássico', style: { color: '#f59e0b', background: 'transparent', fontSize: '10px' } } },
        { y: 1.0, borderColor: '#10b981', strokeDashArray: 4, label: { text: 'Boas', style: { color: '#10b981', background: 'transparent', fontSize: '10px' } } },
      ],
    },
  };

  const series = [
    { name: '🌊 Onda (altura na praia)', data: waveSeries },
    { name: '🌀 Swell (onda远 de origem)', data: swellSeries },
  ];

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Gráfico de previsão de ondas">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Previsão Horária — Ondas</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500" title="Linha tracejada indicando faixas de qualidade">
          <FaInfoCircle className="w-3 h-3" aria-hidden="true" />
          <span>Linhas tracejadas = faixas de qualidade</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mb-3 text-[10px]">
        <span className="text-slate-400">
          <span className="text-blue-400 font-medium">Onda</span> = altura total que chega na praia
        </span>
        <span className="text-slate-400">
          <span className="text-cyan-400 font-medium">Swell</span> = onda gerada longe da costa
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-slate-500">Pico atual:</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${bestQuality.color}20`, color: bestQuality.color, border: `1px solid ${bestQuality.color}40` }}>
          {bestQuality.label} ({maxWave}m)
        </span>
      </div>
      <div className="w-full" style={{ height: '350px' }}>
        <Chart options={options} series={series} type="area" height="100%" width="100%" />
      </div>
    </section>
  );
}
