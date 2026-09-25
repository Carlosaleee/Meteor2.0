export type WindQuality = {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
};

export function windQuality(speed: number): WindQuality {
  if (speed < 6) return { label: 'Calmo', color: '#94a3b8', bgClass: 'bg-slate-500/20', textClass: 'text-slate-400' };
  if (speed < 12) return { label: 'Leve', color: '#06b6d4', bgClass: 'bg-cyan-500/20', textClass: 'text-cyan-400' };
  if (speed < 20) return { label: 'Moderado', color: '#10b981', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400' };
  if (speed < 30) return { label: 'Forte', color: '#f59e0b', bgClass: 'bg-amber-500/20', textClass: 'text-amber-400' };
  if (speed < 40) return { label: 'Muito Forte', color: '#f97316', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400' };
  return { label: 'Tempestuoso', color: '#ef4444', bgClass: 'bg-red-500/20', textClass: 'text-red-400' };
}

export function beaufortScale(speed: number): number {
  if (speed < 1) return 0;
  if (speed < 6) return 1;
  if (speed < 12) return 2;
  if (speed < 20) return 3;
  if (speed < 29) return 4;
  if (speed < 39) return 5;
  if (speed < 50) return 6;
  if (speed < 61) return 7;
  if (speed < 74) return 8;
  if (speed < 88) return 9;
  if (speed < 103) return 10;
  if (speed < 117) return 11;
  return 12;
}

export function beaufortDescription(force: number): string {
  const descriptions = [
    'Calmo', 'Brisa leve', 'Brisa fraca', 'Brisa moderada',
    'Brisa fresca', 'Vento fresco', 'Vento forte',
    'Vento muito forte', 'Tempestade', 'Tempestade forte', 'Tempestade violenta',
    'Tempestade violenta', 'Furacão',
  ];
  return descriptions[force] ?? 'Desconhecido';
}

export function windDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

export function surfWindQuality(windSpeed: number, windDirection: number, exposure: string): WindQuality {
  const isOffshore = isOffshoreWind(windDirection, exposure);
  const isOnshore = isOnshoreWind(windDirection, exposure);

  if (windSpeed < 6) return { label: 'Sem vento', color: '#94a3b8', bgClass: 'bg-slate-500/20', textClass: 'text-slate-400' };
  if (isOffshore) return { label: 'Offshore ✓', color: '#10b981', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400' };
  if (isOnshore) return { label: 'Onshore ✗', color: '#ef4444', bgClass: 'bg-red-500/20', textClass: 'text-red-400' };
  return { label: 'Cross-shore', color: '#f59e0b', bgClass: 'bg-amber-500/20', textClass: 'text-amber-400' };
}

function isOffshoreWind(windDirection: number, exposure: string): boolean {
  const exposureMap: Record<string, number[]> = {
    'Leste': [225, 315],
    'Oeste': [45, 135],
    'Norte': [135, 225],
    'Sul': [315, 45],
    'Nordeste': [200, 290],
    'Noroeste': [20, 110],
    'Sudeste': [250, 340],
    'Sudoeste': [70, 160],
  };

  const [min, max] = exposureMap[exposure] ?? [0, 360];
  if (min > max) {
    return windDirection >= min || windDirection <= max;
  }
  return windDirection >= min && windDirection <= max;
}

function isOnshoreWind(windDirection: number, exposure: string): boolean {
  const offshoreRanges: Record<string, [number, number][]> = {
    'Leste': [[225, 315]],
    'Oeste': [[45, 135]],
    'Norte': [[135, 225]],
    'Sul': [[315, 45]],
  };

  const ranges = offshoreRanges[exposure];
  if (!ranges) return false;

  for (const [min, max] of ranges) {
    const oppositeMin = (min + 180) % 360;
    const oppositeMax = (max + 180) % 360;

    if (oppositeMin > oppositeMax) {
      if (windDirection >= oppositeMin || windDirection <= oppositeMax) return true;
    } else {
      if (windDirection >= oppositeMin && windDirection <= oppositeMax) return true;
    }
  }
  return false;
}

export function kitesurfWindQuality(speed: number): WindQuality {
  if (speed < 12) return { label: 'Insuficiente', color: '#94a3b8', bgClass: 'bg-slate-500/20', textClass: 'text-slate-400' };
  if (speed < 18) return { label: 'Bom (leve)', color: '#06b6d4', bgClass: 'bg-cyan-500/20', textClass: 'text-cyan-400' };
  if (speed < 25) return { label: 'Ótimo', color: '#10b981', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400' };
  if (speed < 35) return { label: 'Excelente', color: '#f59e0b', bgClass: 'bg-amber-500/20', textClass: 'text-amber-400' };
  return { label: 'Perigoso', color: '#ef4444', bgClass: 'bg-red-500/20', textClass: 'text-red-400' };
}
