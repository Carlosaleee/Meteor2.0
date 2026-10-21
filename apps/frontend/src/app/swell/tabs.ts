/** Abas da pagina /swell — mesma lista usada pelo SwellTabs. */
export const SWELL_TABS = ['overview', 'news', 'forecast', 'wind', 'spots'] as const;

export type SwellTab = typeof SWELL_TABS[number];

export const DEFAULT_SWELL_TAB: SwellTab = 'overview';

/**
 * Resolve a aba pedida via ?tab= (deep-link usado pelos CTAs da capa).
 * Query ausente mantem a aba atual; query invalida cai para 'overview'.
 */
export function resolveSwellTab(requested: string | null, current: SwellTab = DEFAULT_SWELL_TAB): SwellTab {
  if (!requested) return current;
  return (SWELL_TABS as readonly string[]).includes(requested)
    ? (requested as SwellTab)
    : DEFAULT_SWELL_TAB;
}
