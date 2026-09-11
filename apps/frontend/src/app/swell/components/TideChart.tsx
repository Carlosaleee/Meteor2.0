'use client';

import dynamic from 'next/dynamic';
import type { HourlyMarinePoint } from '@/lib/api';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type TideChartProps = {
  data: HourlyMarinePoint[];
};

export function TideChart({ data }: TideChartProps) {
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
      labels: { style: { colors: '#94a3b8', fontSize: '10px' }, rotate: -45, rotateAlways: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: 'Altura do Mar (m)', style: { color: '#64748b', fontSize: '10px' } },
      labels: { style: { colors: '#94a3b8', fontSize: '10px' }, formatter: v => `${v}m` },
      min: Math.max(0, minH - 0.3),
      max: maxH + 0.3,
    },
    annotations: {
      yaxis: [
        {
          y: maxH,
          borderColor: '#f59e0b',
          strokeDashArray: 4,
          label: { text: `Alta ${maxH}m`, style: { color: '#f59e0b', background: '#1e293b', fontSize: '10px' } },
        },
        {
          y: minH,
          borderColor: '#3b82f6',
          strokeDashArray: 4,
          label: { text: `Baixa ${minH}m`, style: { color: '#3b82f6', background: '#1e293b', fontSize: '10px' } },
        },
      ],
    },
    tooltip: {
      theme: 'dark',
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const h = w.globals.series[seriesIndex][dataPointIndex];
        const tp = tidePoints.find(t => t.index === dataPointIndex);
        const tipo = tp ? (tp.type === 'Alta' ? '🌊 Maré Alta' : '🏖️ Maré Baixa') : '🌊';
        const bg = tp ? (tp.type === 'Alta' ? '#f59e0b' : '#3b82f6') : '#10b981';
        return `<div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-xs space-y-1">
          <div class="text-slate-300 font-medium">${categories[dataPointIndex]}</div>
          <div class="font-bold" style="color:${bg}">${tipo}: ${h}m</div>
          <div class="text-slate-400">Altura do mar: ${h} metros</div>
        </div>`;
      },
    },
    grid: {
      borderColor: '#1e293b',
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
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5" aria-label="Gráfico de marés">
      <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Tabla de Maré</h3>
      <p className="text-[10px] text-slate-500 mb-3">
        Maré alta = melhor para surfistas experientes · Maré baixa = melhor para iniciantes e praia exposta
      </p>
      <div className="w-full" style={{ height: '320px' }}>
        <Chart options={options} series={[{ name: 'Maré', data: heights }]} type="line" height="100%" width="100%" />
      </div>
      <div className="flex gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" /> Maré Alta
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" /> Maré Baixa
        </span>
      </div>

      {/* Tabela de próximas marés */}
      {tidePoints.length > 0 && (
        <div className="mt-4">
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Próximas Marés</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tidePoints.slice(0, 4).map((tp, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border text-center ${tp.type === 'Alta' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}
                title={`${tp.type} às ${categories[tp.index]}: ${tp.height}m`}
                aria-label={`Maré ${tp.type.toLowerCase()} às ${categories[tp.index]}: ${tp.height} metros`}
              >
                <span className="text-lg" aria-hidden="true">{tp.type === 'Alta' ? '🌊' : '🏖️'}</span>
                <p className={`text-xs font-bold ${tp.type === 'Alta' ? 'text-amber-400' : 'text-blue-400'}`}>
                  {tp.type}
                </p>
                <p className="text-[10px] text-slate-400">{categories[tp.index]}</p>
                <p className="text-xs text-white font-medium">{tp.height}m</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
