'use client';

import dynamic from 'next/dynamic';
import { FaInfoCircle } from 'react-icons/fa';
import type { HourlyMarinePoint } from '@/lib/api';
import { windQuality, windDir, beaufortScale } from './windUtils';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type WindChartProps = {
  data: HourlyMarinePoint[];
};

export function WindChart({ data }: WindChartProps) {
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
      labels: { style: { colors: '#94a3b8', fontSize: '10px' }, rotate: -45, rotateAlways: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: 'km/h', style: { color: '#64748b', fontSize: '10px' } },
      labels: { style: { colors: '#94a3b8', fontSize: '10px' }, formatter: v => `${v}` },
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
      custom: ({ series, dataPointIndex }) => {
        const speed = series[0]?.[dataPointIndex] ?? 0;
        const gust = series[1]?.[dataPointIndex] ?? 0;
        const dir = data[dataPointIndex]?.windDirection ?? 0;
        const q = windQuality(speed);
        const dirLabel = windDir(dir);
        return `<div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-xs space-y-1">
          <div class="text-slate-300 font-medium">${categories[dataPointIndex]}</div>
          <div class="text-white font-bold">Velocidade: ${speed} km/h <span style="color:${q.color}">(${q.label})</span></div>
          <div class="text-orange-400">Rajada: ${gust} km/h</div>
          <div class="text-slate-400">Direção: ${dirLabel} (${dir}°)</div>
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
        { y: 12, borderColor: '#06b6d4', strokeDashArray: 4, label: { text: 'Bom p/ surf', style: { color: '#06b6d4', background: 'transparent', fontSize: '10px' } } },
        { y: 20, borderColor: '#10b981', strokeDashArray: 4, label: { text: 'Ótimo p/ kitesurf', style: { color: '#10b981', background: 'transparent', fontSize: '10px' } } },
        { y: 30, borderColor: '#f59e0b', strokeDashArray: 4, label: { text: 'Perigoso', style: { color: '#f59e0b', background: 'transparent', fontSize: '10px' } } },
      ],
    },
  };

  const series = [
    { name: '💨 Velocidade', data: speedSeries },
    { name: '🌪️ Rajada', data: gustSeries },
  ];

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Gráfico de previsão de ventos">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Previsão Horária — Ventos</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500" title="Linha tracejada indicando faixas de qualidade">
          <FaInfoCircle className="w-3 h-3" aria-hidden="true" />
          <span>Linhas tracejadas = faixas de qualidade</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mb-3 text-[10px]">
        <span className="text-slate-400">
          <span className="text-sky-400 font-medium">Velocidade</span> = vento sustentado
        </span>
        <span className="text-slate-400">
          <span className="text-orange-400 font-medium">Rajada</span> = rajadas máximas
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-[10px] text-slate-500">Pico atual:</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${bestQuality.color}20`, color: bestQuality.color, border: `1px solid ${bestQuality.color}40` }}>
          {bestQuality.label} ({maxSpeed} km/h)
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50">
          Beaufort {maxBeaufort}
        </span>
        {maxGust > maxSpeed * 1.3 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Rajada forte ({maxGust} km/h)
          </span>
        )}
      </div>
      <div className="w-full" style={{ height: '350px' }}>
        <Chart options={options} series={series} type="area" height="100%" width="100%" />
      </div>
    </section>
  );
}
