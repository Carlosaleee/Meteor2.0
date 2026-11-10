/**
 * Interpolacao simples de variaveis em chaves de i18n.
 * `fmt('Slide {i} de {n}', { i: 1, n: 5 })` -> 'Slide 1 de 5'.
 */
export function fmt(str: string | undefined, vars: Record<string, string | number>): string {
  if (!str) return '';
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}
