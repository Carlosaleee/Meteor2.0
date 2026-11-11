'use client';

import dynamic from 'next/dynamic';
import type { HourlyMarinePoint } from '@/lib/api';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useDict } from '@/i18n/context';
import { swell } from '@/i18n/dictionaries/swell';
import { fmt } from '@/i18n/format';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type TideChartProps = {
  data: HourlyMarinePoint[];
};

export function TideChart({ data }: TideChartProps) {
  const mode = useThemeMode();
  const t = useDict(swell);
  const isLight = mode === 'light';
  const labelColor = isLight ? '#475569' : '#94a3b8';
  const titleColor = isLight ? '#475569' : '#64748b';
  const gridColor = isLight ? '#e2e8f0' : '#1e293b';
  const annotationBg = isLight ? '#ffffff' : '#1e293b';
  const categories = data.map(d => {
    const h = new Date(d.time).getHours();
    return `${String(h).padStart(2, '0')}:00`;
  });

  const heights = data.map(d => Number(d.waveHeight.toFixed(2)));
  const maxH = Math.max(...heights);
  const minH = Math.min(...heights);

  // Find local maxima and minima for tide points
  const tidePoints: Array<{ index: number; type: 'Alta' | 'Baixa'; height: number }> = [];
  for (let i = 0; i < heights.length; i++) {
    const prev = i > 0 ? heights[i - 1] : heights[i];
    const next = i < heights.length - 1 ? heights[i + 1] : heights[i];
    if (heights[i] >= prev && heights[i] >= next && (heights[i] === maxH || tidePoints.filter(t => t.type === 'Alta').length < 2)) {
      tidePoints.push({ index: i, type: 'Alta', height: heights[i] });
    } else if (heights[i] <= prev && heights[i] <= next && (heights[i] === minH || tidePoints.filter(t => t.type === 'Baixa').length < 2)) {
      tidePoints.push({ index: i, type: 'Baixa', height: heights[i] });
    }
  }

  // Sort by time
  tidePoints.sort((a, b) => a.index - b.index);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      height: 320,
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    colors: ['#10b981'],
    stroke: { width: 2.5, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories,
      labels: { style: { colors: labelColor, fontSize: '10px' }, rotate: -45, rotateAlways: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: t['tide.yAxis'], style: { color: titleColor, fontSize: '10px' } },
      labels: { style: { colors: labelColor, fontSize: '10px' }, formatter: v => `${v}m` },
      min: Math.max(0, minH - 0.3),
      max: maxH + 0.3,
    },
    annotations: {
      yaxis: [
        {
          y: maxH,
          borderColor: '#f59e0b',
          strokeDashArray: 4,
          label: { text: fmt(t['tide.annHigh'], { value: maxH }), style: { color: '#f59e0b', background: annotationBg, fontSize: '10px' } },
        },
        {
          y: minH,
          borderColor: '#3b82f6',
          strokeDashArray: 4,
          label: { text: fmt(t['tide.annLow'], { value: minH }), style: { color: '#3b82f6', background: annotationBg, fontSize: '10px' } },
        },
      ],
    },
    tooltip: {
      theme: mode,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const h = w.globals.series[seriesIndex][dataPointIndex];
        const tp = tidePoints.find(tp => tp.index === dataPointIndex);
        const tipo = tp ? (tp.type === 'Alta' ? t['tide.tipHigh'] : t['tide.tipLow']) : '🌊';
        const bg = tp ? (tp.type === 'Alta' ? '#f59e0b' : '#3b82f6') : '#10b981';
        return `<div class="bg-card border border-card-line rounded-lg px-4 py-3 text-xs space-y-1">
          <div class="text-card-subtle font-medium">${categories[dataPointIndex]}</div>
          <div class="font-bold" style="color:${bg}">${tipo}: ${h}m</div>
          <div class="text-card-muted">${fmt(t['tide.tipHeight'], { value: h })}</div>
        </div>`;
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },
    dataLabels: { enabled: false },
    markers: {
      size: 5,
      colors: ['#10b981'],
      strokeColors: '#0f172a',
      strokeWidth: 2,
      hover: { size: 7 },
    },
  };

  return (
    <section className="bg-card/80 border border-card-border rounded-2xl p-5" aria-label={t['tide.sectionAria']}>
      <h3 className="text-sm font-semibold text-card-subtle mb-2 uppercase tracking-wider">{t['tide.heading']}</h3>
      <p className="text-[10px] text-card-dim mb-3">
        {t['tide.legend']}
      </p>
      <div className="w-full" style={{ height: '320px' }}>
        <Chart options={options} series={[{ name: t['tide.series'], data: heights }]} type="line" height="100%" width="100%" />
      </div>
      <div className="flex gap-4 mt-3 text-xs text-card-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" /> {t['tide.high']}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" /> {t['tide.low']}
        </span>
      </div>

      {/* Tabela de próximas marés */}
      {tidePoints.length > 0 && (
        <div className="mt-4">
          <h4 className="text-[10px] font-semibold text-card-muted uppercase tracking-wider mb-2">{t['tide.upcoming']}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tidePoints.slice(0, 4).map((tp, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border text-center ${tp.type === 'Alta' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}
                title={fmt(t['tide.cardTitle'], { type: tp.type === 'Alta' ? t['tide.typeAlta'] : t['tide.typeBaixa'], time: categories[tp.index], height: tp.height })}
                aria-label={fmt(t['tide.cardAria'], { type: tp.type === 'Alta' ? t['tide.typeAlta'] : t['tide.typeBaixa'], time: categories[tp.index], height: tp.height })}
              >
                <span className="text-lg" aria-hidden="true">{tp.type === 'Alta' ? '🌊' : '🏖️'}</span>
                <p className={`text-xs font-bold ${tp.type === 'Alta' ? 'text-amber-400' : 'text-blue-400'}`}>
                  {tp.type === 'Alta' ? t['tide.typeAlta'] : t['tide.typeBaixa']}
                </p>
                <p className="text-[10px] text-card-muted">{categories[tp.index]}</p>
                <p className="text-xs text-card-text font-medium">{tp.height}m</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
