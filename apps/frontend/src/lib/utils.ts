export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export const CATEGORY_CONFIG: Record<string, { label: string; emoji: string }> = {
  todas: { label: 'Todas', emoji: '📰' },
  transito: { label: 'Trânsito', emoji: '🚗' },
  noticia: { label: 'Notícias', emoji: '📰' },
  policial: { label: 'Policial', emoji: '🚨' },
  turismo: { label: 'Turismo', emoji: '🏖️' },
  cotidiano: { label: 'Cotidiano', emoji: '🏠' },
};

export const ROUTE_CONDITION_COLORS: Record<string, string> = {
  LIVRE: '#22c55e',
  MODERADO: '#eab308',
  LENTO: '#f97316',
  BLOQUEADO: '#ef4444',
  OPERACIONAL: '#06b6d4',
  INTERROMPIDO: '#ef4444',
};

export function windDirectionLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}
