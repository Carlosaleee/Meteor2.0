import { Injectable, Logger } from '@nestjs/common';
import { fetchWithTimeout } from '../../common/http/fetch-timeout';

export type RouteCondition = 'LIVRE' | 'MODERADO' | 'LENTO' | 'BLOQUEADO';

export type LiveRouteStatus = {
  condition: RouteCondition;
  description: string;
  updatedAt: string;
};

export type LiveRoutesResult = {
  /** Status por id de rota (ex.: 'sp-222'), apenas rodovias estaduais cobertas. */
  routes: Record<string, LiveRouteStatus>;
  /** Link publico para o usuario verificar os dados (painel CCM/ARTESP). */
  sourceUrl: string;
};

type ArtspOccurrence = {
  classe?: string;
  rodovia?: { slug?: string; nome?: string };
  km_inicial?: number;
  km_final?: number;
  atualizado_em?: string;
  dt_hr_conhecimento?: string;
  interdicoes?: unknown[];
};

const PANEL_URL = 'https://ccm.artesp.sp.gov.br/rodovias/waze';
const API_URL = 'https://ccm.artesp.sp.gov.br/rodovias/api/ocorrencias/';
const FETCH_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 10 * 60 * 1000;

/** Rodovias estaduais do Vale do Ribeira cobertas pelo CCM/ARTESP (BR-116 e balsa nao sao). */
const TRACKED: Record<string, { code: string; slug: string }> = {
  'sp-222': { code: 'SP 222', slug: 'sp-222' },
  'sp-165': { code: 'SP 165', slug: 'sp-165' },
  'sp-055': { code: 'SP 055', slug: 'sp-055' },
};

const SEVERITY: Record<RouteCondition, number> = { LIVRE: 0, MODERADO: 1, LENTO: 2, BLOQUEADO: 3 };

const worst = (a: RouteCondition, b: RouteCondition): RouteCondition =>
  SEVERITY[a] >= SEVERITY[b] ? a : b;

@Injectable()
export class ArtspWazeRepository {
  private readonly logger = new Logger(ArtspWazeRepository.name);
  private cache: LiveRoutesResult | null = null;
  private cacheTs = 0;

  clearCache(): void {
    this.cache = null;
    this.cacheTs = 0;
  }

  /**
   * Status ao vivo das rodovias estaduais.
   * Fonte primaria: painel Waze publico do CCM/ARTESP (sem chave, atualiza a cada ~10 min).
   * Fonte opcional: API oficial de ocorrencias quando ARTESP_API_KEY esta configurada
   * (12 req/h — cache de 10 min respeita o limite). Falha total -> null (fallback estatico).
   */
  async getLiveRoutes(): Promise<LiveRoutesResult | null> {
    if (this.cache && Date.now() - this.cacheTs < CACHE_TTL_MS) {
      return this.cache;
    }

    const [panel, occurrences] = await Promise.all([
      this.fetchPanelStatus(),
      this.fetchOfficialOccurrences(),
    ]);

    const result = this.mergeSources(panel, occurrences);
    if (result) {
      this.cache = result;
      this.cacheTs = Date.now();
    }
    return result;
  }

  private mergeSources(
    panel: Partial<Record<string, LiveRouteStatus>> | null,
    occurrences: Partial<Record<string, LiveRouteStatus>> | null,
  ): LiveRoutesResult | null {
    if (!panel && !occurrences) return null;

    const routes: Record<string, LiveRouteStatus> = {};
    for (const id of Object.keys(TRACKED)) {
      const fromPanel = panel?.[id];
      const fromApi = occurrences?.[id];
      if (!fromPanel && !fromApi) {
        // Painel parseado com sucesso e ausencia de registro = sem lentidao reportada.
        routes[id] = {
          condition: 'LIVRE',
          description: panel
            ? 'Sem lentidão reportada no Waze (painel CCM/ARTESP)'
            : 'Sem ocorrência ativa registrada no CCM/ARTESP',
          updatedAt: new Date().toISOString(),
        };
        continue;
      }
      routes[id] = this.worstOf(fromPanel, fromApi);
    }

    return { routes, sourceUrl: PANEL_URL };
  }

  private worstOf(
    a?: LiveRouteStatus,
    b?: LiveRouteStatus,
  ): LiveRouteStatus {
    if (!a) return b as LiveRouteStatus;
    if (!b) return a;
    const condition = worst(a.condition, b.condition);
    const chosen = a.condition === condition ? a : b;
    const updatedAt = new Date(a.updatedAt) >= new Date(b.updatedAt) ? a.updatedAt : b.updatedAt;
    return { condition, description: chosen.description, updatedAt };
  }

  /** Painel Waze publico (HTML) — parser do resumo #text__tempo-viagem + cards data-trafego-card. */
  private async fetchPanelStatus(): Promise<Partial<Record<string, LiveRouteStatus>> | null> {
    try {
      const res = await fetchWithTimeout(
        PANEL_URL,
        { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' } },
        FETCH_TIMEOUT_MS,
      );
      if (!res.ok) throw new Error(`painel CCM/ARTESP retornou ${res.status}`);
      const html = await res.text();
      const parsed = this.parsePanelHtml(html);
      if (!parsed) throw new Error('painel CCM/ARTESP sem bloco reconhecivel');
      return parsed;
    } catch (err) {
      this.logger.warn(`Falha ao obter painel Waze da ARTESP: ${err}`);
      return null;
    }
  }

  private parsePanelHtml(html: string): Partial<Record<string, LiveRouteStatus>> | null {
    const summary = html.match(/id="text__tempo-viagem">([\s\S]*?)<\/div>/)?.[1];
    if (!summary) return null;

    const collected = summary.match(/Coletado em (\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    // Horario do painel em horario de Sao Paulo (UTC-3; Brasil sem DST desde 2019).
    const updatedAt = collected
      ? `${collected[3]}-${collected[2]}-${collected[1]}T${collected[4]}:${collected[5]}:00-03:00`
      : new Date().toISOString();

    const summaryEntries = this.parseSummaryEntries(summary);
    const cardLevels = this.parseCardLevels(html);

    const routes: Partial<Record<string, LiveRouteStatus>> = {};
    for (const [id, { code }] of Object.entries(TRACKED)) {
      const entry = summaryEntries.get(code);
      const level = cardLevels.get(code)?.nivel ?? 0;
      const local = cardLevels.get(code)?.local ?? '';

      const fromSummary: LiveRouteStatus | null = entry
        ? this.statusFromSummary(entry, updatedAt)
        : null;
      const fromCard: LiveRouteStatus | null = level >= 3 ? this.statusFromLevel(level, local, updatedAt) : null;

      const status = this.worstOf(fromSummary ?? undefined, fromCard ?? undefined) ?? {
        condition: 'LIVRE' as RouteCondition,
        description: 'Sem lentidão reportada no Waze (painel CCM/ARTESP)',
        updatedAt,
      };
      routes[id] = status;
    }
    return routes;
  }

  private parseSummaryEntries(summary: string): Map<string, { delay: string; extent: string }> {
    const entries = new Map<string, { delay: string; extent: string }>();
    const regex = /\*(SP(?:M|A|I)?\s\d{3}(?:\/\d{3})?)\*:\s*([^|<]+?)(?:\s\|\s_?([^_<]+)_?)?\s*<br/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(summary)) !== null) {
      entries.set(match[1].trim(), {
        delay: match[2].trim().replace(/_/g, ''),
        extent: (match[3] ?? '').trim(),
      });
    }
    return entries;
  }

  private parseCardLevels(html: string): Map<string, { nivel: number; local: string }> {
    const levels = new Map<string, { nivel: number; local: string }>();
    const chunks = html.split('data-trafego-card').slice(1);
    for (const chunk of chunks) {
      const code = chunk.match(/data-rodovia="([^"]*)"/)?.[1]?.trim();
      const nivel = Number(chunk.match(/data-nivel="(\d)"/)?.[1] ?? 0);
      if (!code || !Number.isFinite(nivel)) continue;
      const local = this.decodeEntities(chunk.match(/data-local="([^"]*)"/)?.[1]?.trim() ?? '');
      const prev = levels.get(code);
      if (!prev || nivel > prev.nivel) levels.set(code, { nivel, local });
    }
    return levels;
  }

  private statusFromSummary(entry: { delay: string; extent: string }, updatedAt: string): LiveRouteStatus {
    const extent = entry.extent ? ` — ${entry.extent}` : '';
    if (/interd/i.test(entry.delay)) {
      return {
        condition: 'BLOQUEADO',
        description: `Interdição ou sem dados de tráfego${extent}`,
        updatedAt,
      };
    }

    const minutes = this.parseDelayMinutes(entry.delay);
    if (minutes === null) {
      return { condition: 'LIVRE', description: `Sem lentidão reportada no Waze${extent}`, updatedAt };
    }
    if (minutes >= 60) {
      return { condition: 'LENTO', description: `Lentidão de ${entry.delay}${extent}`, updatedAt };
    }
    if (minutes >= 15) {
      return { condition: 'MODERADO', description: `Lentidão de ${entry.delay}${extent}`, updatedAt };
    }
    return { condition: 'LIVRE', description: `Lentidão leve de ${entry.delay}${extent}`, updatedAt };
  }

  private statusFromLevel(level: number, local: string, updatedAt: string): LiveRouteStatus {
    const where = local ? ` — ${local}` : '';
    if (level >= 5) {
      return { condition: 'BLOQUEADO', description: `Via bloqueada (N${level})${where}`, updatedAt };
    }
    if (level === 4) {
      return { condition: 'LENTO', description: `Lentidão severa (N${level})${where}`, updatedAt };
    }
    return { condition: 'MODERADO', description: `Lentidão (N${level})${where}`, updatedAt };
  }

  private parseDelayMinutes(text: string): number | null {
    const hours = text.match(/(\d+)\s*h/);
    const mins = text.match(/(\d+)\s*min/);
    if (!hours && !mins) return null;
    return (hours ? parseInt(hours[1], 10) * 60 : 0) + (mins ? parseInt(mins[1], 10) : 0);
  }

  /** API oficial de ocorrencias (exige ARTESP_API_KEY; 12 req/h). Sem chave -> null silencioso. */
  private async fetchOfficialOccurrences(): Promise<Partial<Record<string, LiveRouteStatus>> | null> {
    const apiKey = (process.env.ARTESP_API_KEY ?? '').trim();
    if (!apiKey) return null;

    try {
      const slugs = Object.values(TRACKED).map(t => t.slug).join(',');
      const url = `${API_URL}?filtro_rodovia=${slugs}&filtro_finalizada=1&include=interdicoes&limit=50`;
      const res = await fetchWithTimeout(
        url,
        {
          headers: {
            Authorization: `Api-Key ${apiKey}`,
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)',
          },
        },
        FETCH_TIMEOUT_MS,
      );
      if (!res.ok) throw new Error(`API CCM/ARTESP retornou ${res.status}`);
      const body = (await res.json()) as { results?: ArtspOccurrence[] };
      if (!Array.isArray(body.results)) throw new Error('API CCM/ARTESP sem campo results');
      return this.statusFromOccurrences(body.results);
    } catch (err) {
      this.logger.warn(`Falha ao obter ocorrencias oficiais da ARTESP: ${err}`);
      return null;
    }
  }

  private statusFromOccurrences(results: ArtspOccurrence[]): Partial<Record<string, LiveRouteStatus>> {
    const byRoad: Record<string, LiveRouteStatus> = {};

    for (const oc of results) {
      const id = oc.rodovia?.slug;
      if (!id || !(id in TRACKED)) continue;

      const km = oc.km_inicial !== undefined && oc.km_final !== undefined
        ? ` km ${oc.km_inicial}–${oc.km_final}`
        : '';
      const classe = oc.classe || 'Ocorrência';
      const blocked = (oc.interdicoes?.length ?? 0) > 0;
      const candidate: LiveRouteStatus = blocked
        ? { condition: 'BLOQUEADO', description: `Interdição ativa — ${classe}${km}`, updatedAt: oc.atualizado_em ?? oc.dt_hr_conhecimento ?? new Date().toISOString() }
        : { condition: 'MODERADO', description: `${classe} ativa${km}`, updatedAt: oc.atualizado_em ?? oc.dt_hr_conhecimento ?? new Date().toISOString() };

      byRoad[id] = byRoad[id] ? this.worstOf(byRoad[id], candidate) : candidate;
    }

    return byRoad;
  }

  private decodeEntities(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(parseInt(code, 10)));
  }
}
