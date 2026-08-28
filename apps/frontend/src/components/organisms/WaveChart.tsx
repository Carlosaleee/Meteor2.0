"use client";

import { motion } from "motion/react";

type WaveChartProps = {
  points: Array<{ time: string; waveHeightM: number }>;
  dayIndex: number;
};

export function WaveChart({ points, dayIndex }: WaveChartProps) {
  const slice = points.slice(dayIndex * 24, dayIndex * 24 + 24);
  const series = slice.length > 0 ? slice : points.slice(0, 24);
  const max = Math.max(0.1, ...series.map((p) => p.waveHeightM));
  const width = 320;
  const height = 88;
  const d = series
    .map((point, index) => {
      const x = series.length === 1 ? 0 : (index / (series.length - 1)) * width;
      const y = height - (point.waveHeightM / max) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="border border-line bg-graphite p-3">
      <div className="mb-2 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
        Wave height / 24h
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full overflow-visible">
        <motion.path
          d={d || "M0 88 L320 88"}
          fill="none"
          stroke="currentColor"
          className="text-gold"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </svg>
    </div>
  );
}
