/**
 * Horario de referencia em America/Sao_Paulo (SP).
 *
 * Motivo: os dados do Open-Meteo chegam como "wall clock" de SP
 * (`timezone=America/Sao_Paulo`, timestamps naive como 2026-10-19T14:00),
 * mas em producao (Vercel) o processo roda em UTC — `new Date().getHours()`
 * ficava 3h desalinhado e servia dados de ontem como "agora".
 */
const SP_TZ = 'America/Sao_Paulo';

const hourFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SP_TZ,
  hour: 'numeric',
  hourCycle: 'h23',
});

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SP_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Hora atual (0-23) no fuso de Sao Paulo. */
function spHour(date: Date = new Date()): number {
  return Number(hourFormatter.format(date)) % 24;
}

/** Data atual em SP no formato YYYY-MM-DD. */
function spDateIso(date: Date = new Date()): string {
  return dateFormatter.format(date);
}

/** Chave de hora cheia em SP: YYYY-MM-DDTHH (casa com timestamps naive do Open-Meteo). */
export function spNowKey(date: Date = new Date()): string {
  return `${spDateIso(date)}T${String(spHour(date)).padStart(2, '0')}`;
}

/**
 * Extrai a "chave de hora" (YYYY-MM-DDTHH) de um timestamp naive do Open-Meteo.
 * Fallback defensivo: se o formato nao for o esperado, usa a leitura local.
 */
export function hourKeyFromNaive(time: string): string {
  const naive = time.slice(0, 13);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(naive)) return naive;
  const d = new Date(time);
  return isNaN(d.getTime()) ? '' : `${d.toISOString().slice(0, 10)}T${String(d.getHours()).padStart(2, '0')}`;
}
