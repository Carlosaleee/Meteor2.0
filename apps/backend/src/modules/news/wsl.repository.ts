import { Injectable, Logger } from '@nestjs/common';

export type WslRankingEntry = {
  rank: number;
  name: string;
  country: string;
  points: number;
  trend: number;
};

export type WslEvent = {
  name: string;
  location: string;
  dates: string;
  status: 'Completed' | 'Standby' | 'Upcoming' | 'Live';
  tour: string;
};

export type WslNewsItem = {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
};

type WslRankingsResult = {
  men: WslRankingEntry[];
  women: WslRankingEntry[];
  events: WslEvent[];
  fetchedAt: string;
};

const BASE_URL = 'https://www.worldsurfleague.com';
/** RSS oficial em portugues da WSL para a America Latina (pode ficar dias parado entre etapas). */
const NEWS_RSS_URL = 'https://wsllatinamerica.com/feed/';
/**
 * Segunda fonte: Google News RSS filtrado em 7 dias cobrindo WSL/Philippines Pro.
 * Preenche o gap quando o feed LATAM nao publica (ex.: parada de 03/10 ate a Finals Day
 * do Philippines Pro em 03/11), que antes descartava tudo em filterLast7Days.
 */
const GOOGLE_NEWS_RSS =
  'https://news.google.com/rss/search?q=(WSL%20OR%20%22World%20Surf%20League%22%20OR%20%22Philippines%20Pro%22)%20when:7d&hl=pt-BR&gl=BR&ceid=BR:pt-419';
const FETCH_TIMEOUT_MS = 15_000;
const MAX_NEWS = 12;

@Injectable()
export class WslRepository {
  private readonly logger = new Logger(WslRepository.name);
  private cache: WslRankingsResult | null = null;
  private newsCache: WslNewsItem[] | null = null;
  private newsCacheTs = 0;
  private readonly CACHE_TTL_MS = 30 * 60 * 1000;

  clearCache(): void {
    this.cache = null;
    this.newsCache = null;
    this.newsCacheTs = 0;
  }

  async getRankings(): Promise<WslRankingsResult> {
    if (this.cache && Date.now() - new Date(this.cache.fetchedAt).getTime() < this.CACHE_TTL_MS) {
      return this.cache;
    }

    const [men, women, events] = await Promise.all([
      this.fetchMenRanking(),
      this.fetchWomenRanking(),
      this.fetchEvents(),
    ]);

    const result: WslRankingsResult = {
      men,
      women,
      events,
      fetchedAt: new Date().toISOString(),
    };

    this.cache = result;
    return result;
  }

  async getNews(): Promise<WslNewsItem[]> {
    if (this.newsCache && Date.now() - this.newsCacheTs < this.CACHE_TTL_MS) {
      return this.newsCache;
    }

    // LATAM primeiro (ordem de chamada é contrato do spec), Google News em paralelo como cobertura.
    const [latam, google] = await Promise.all([
      this.fetchNewsFeed(NEWS_RSS_URL, 'WSL LATAM'),
      this.fetchNewsFeed(GOOGLE_NEWS_RSS, 'Google News WSL'),
    ]);

    const merged = this.mergeNews([...latam, ...google]);
    if (merged.length === 0) {
      this.logger.warn('WSL news: both feeds failed or had no recognizable items');
      return [];
    }

    this.newsCache = merged;
    this.newsCacheTs = Date.now();
    return merged;
  }

  private async fetchNewsFeed(url: string, label: string): Promise<WslNewsItem[]> {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`${label} feed returned ${res.status}`);
      const items = this.parseNewsRss(await res.text());
      if (items.length === 0) throw new Error(`${label} feed had no recognizable items`);
      return items;
    } catch (err) {
      this.logger.warn(`Failed to fetch ${label} news: ${err}`);
      return [];
    }
  }

  /** Dedup por título (fontes podem repercutir a mesma notícia), ordena por data desc e limita a MAX_NEWS. */
  private mergeNews(items: WslNewsItem[]): WslNewsItem[] {
    const seen = new Set<string>();
    const merged: WslNewsItem[] = [];
    for (const item of items) {
      const key = item.title.toLowerCase().replace(/\s+/g, ' ').trim();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
    merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return merged.slice(0, MAX_NEWS);
  }

  private parseNewsRss(xml: string): WslNewsItem[] {
    const items: WslNewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      let title = this.stripHtml(this.decodeEntities(this.getTag(block, 'title')));
      const url = this.decodeEntities(this.getTag(block, 'link'));
      const description = this.stripHtml(this.decodeEntities(this.getTag(block, 'description'))).substring(0, 200);
      const pubDate = this.getTag(block, 'pubDate');

      if (title.length < 10 || !url.startsWith('http')) continue;

      // Google News anexa " - Fonte" ao título; o <source> do item identifica a fonte.
      const source = this.stripHtml(this.decodeEntities(this.getTag(block, 'source')));
      if (source) {
        const suffix = ` - ${source}`;
        if (title.endsWith(suffix)) title = title.slice(0, -suffix.length).trim();
      }

      const date = new Date(pubDate);
      items.push({
        title,
        description,
        url,
        image: this.getImage(block),
        publishedAt: isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
      });

      if (items.length >= MAX_NEWS) break;
    }

    return items;
  }

  private getTag(block: string, tag: string): string {
    const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, 'i');
    const match = block.match(regex);
    return match ? match[1].trim() : '';
  }

  private getImage(block: string): string {
    const media =
      block.match(/<media:content[^>]*url="([^"]+)"/i) ||
      block.match(/<media:thumbnail[^>]*url="([^"]+)"/i) ||
      block.match(/<enclosure[^>]*url="([^"]+)"/i);
    return media ? this.decodeEntities(media[1]) : '';
  }

  private stripHtml(text: string): string {
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private decodeEntities(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(parseInt(code, 10)));
  }

  private async fetchMenRanking(): Promise<WslRankingEntry[]> {
    try {
      const res = await fetch(`${BASE_URL}/athletes/tour/mct`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`WSL men ranking returned ${res.status}`);
      const html = await res.text();
      return this.parseRankingHtml(html, this.getDefaultMenRanking());
    } catch (err) {
      this.logger.warn(`Failed to fetch WSL men ranking: ${err}`);
      return this.getDefaultMenRanking();
    }
  }

  private async fetchWomenRanking(): Promise<WslRankingEntry[]> {
    try {
      const res = await fetch(`${BASE_URL}/athletes/tour/wct`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`WSL women ranking returned ${res.status}`);
      const html = await res.text();
      return this.parseRankingHtml(html, this.getDefaultWomenRanking());
    } catch (err) {
      this.logger.warn(`Failed to fetch WSL women ranking: ${err}`);
      return this.getDefaultWomenRanking();
    }
  }

  private async fetchEvents(): Promise<WslEvent[]> {
    try {
      const res = await fetch(`${BASE_URL}/events`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`WSL events returned ${res.status}`);
      const html = await res.text();
      return this.parseEventsHtml(html);
    } catch (err) {
      this.logger.warn(`Failed to fetch WSL events: ${err}`);
      return this.getDefaultEvents();
    }
  }

  private parseRankingHtml(html: string, defaultRanking: WslRankingEntry[]): WslRankingEntry[] {
    const rows = html.split('<tr class="athlete-').slice(1);
    const entries: WslRankingEntry[] = [];

    for (const block of rows) {
      const rankMatch = block.match(/athlete-rank[^>]*>\s*(\d{1,2})\s*</);
      const nameMatch =
        block.match(/avatar-text-primary[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/) ||
        block.match(/aria-label='([^']+)'/);
      const countryMatch = block.match(/athlete-country-name">([^<]+)</);
      const pointsMatch = block.match(/tour-points[^>]*>\s*([\d,]+)\s*</);

      if (!rankMatch || !nameMatch || !pointsMatch) continue;

      const rank = parseInt(rankMatch[1], 10);
      if (isNaN(rank) || rank < 1 || rank > 50) continue;

      const name = nameMatch[1].trim();
      entries.push({
        rank,
        name,
        country: countryMatch ? countryMatch[1].trim() : this.guessCountry(name),
        points: parseInt(pointsMatch[1].replace(/,/g, ''), 10),
        trend: this.parseTrend(block),
      });
    }

    if (entries.length >= 5) return entries.slice(0, 15);
    return defaultRanking;
  }

  private parseTrend(block: string): number {
    const cell = block.match(/athlete-rank-change[^>]*>([\s\S]*?)<\/td>/);
    if (!cell) return 0;
    const body = cell[1];
    const direction = body.includes('positive') ? 1 : body.includes('negative') ? -1 : 0;
    if (direction === 0) return 0;
    const numberMatch = body.match(/(\d{1,2})\s*<\/span>\s*$/);
    return numberMatch ? direction * parseInt(numberMatch[1], 10) : 0;
  }

  private parseEventsHtml(html: string): WslEvent[] {
    const rows = html.split('<tr class="event-').slice(1);
    const events: WslEvent[] = [];

    for (const block of rows) {
      const dateMatch = block.match(/event-date-range[^>]*>([^<]+)</);
      const nameMatch = block.match(/event-schedule-details__event-name[^>]*>([^<]+)/);
      const locationMatch = block.match(/event-schedule-details__location">([^<]+)</);
      const tourMatch = block.match(/event-tour-details__tour-name">([^<]+)</);
      const statusMatch = block.match(/event-status[^>]*><span>(Completed|Standby|Upcoming|Live)<\/span>/);

      if (!dateMatch || !nameMatch || !statusMatch) continue;

      events.push({
        name: nameMatch[1].trim(),
        location: locationMatch ? locationMatch[1].trim() : '',
        dates: dateMatch[1].trim(),
        status: statusMatch[1] as WslEvent['status'],
        tour: tourMatch ? tourMatch[1].trim() : 'Championship Tour',
      });
    }

    if (events.length < 2) return this.getDefaultEvents();

    // Em andamento primeiro; Completed no fim mas sem ser cortado (slice cobre as 15 linhas da página,
    // antes slice(0,10) com Completed por último escondia a etapa recém-concluída — ex.: Philippines Pro).
    const statusPriority: Record<string, number> = { Live: 0, Upcoming: 1, Standby: 2, Completed: 3 };
    events.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
    return events.slice(0, 15);
  }

  private guessCountry(name: string): string {
    const brazilian = ['Italo Ferreira', 'Yago Dora', 'Gabriel Medina', 'Miguel Pupo', 'Samuel Pupo',
      'Joao Chianca', 'Filipe Toledo', 'Alejo Muniz', 'Mateus Herdy', 'Luana Silva'];
    if (brazilian.some(b => name.includes(b))) return 'Brazil';
    return '';
  }

  private getDefaultMenRanking(): WslRankingEntry[] {
    return [
      { rank: 1, name: 'Leonardo Fioravanti', country: 'Italy', points: 40015, trend: 0 },
      { rank: 2, name: 'Italo Ferreira', country: 'Brazil', points: 39930, trend: 0 },
      { rank: 3, name: 'Yago Dora', country: 'Brazil', points: 37695, trend: 0 },
      { rank: 4, name: 'Gabriel Medina', country: 'Brazil', points: 35410, trend: 0 },
      { rank: 5, name: 'Miguel Pupo', country: 'Brazil', points: 32770, trend: 0 },
      { rank: 6, name: 'Griffin Colapinto', country: 'United States', points: 31375, trend: 0 },
      { rank: 7, name: 'Ethan Ewing', country: 'Australia', points: 28575, trend: 0 },
      { rank: 8, name: 'Samuel Pupo', country: 'Brazil', points: 27960, trend: 0 },
    ];
  }

  private getDefaultWomenRanking(): WslRankingEntry[] {
    return [
      { rank: 1, name: 'Carissa Moore', country: 'Hawaii', points: 39575, trend: 0 },
      { rank: 2, name: 'Gabriela Bryan', country: 'Hawaii', points: 37065, trend: 0 },
      { rank: 3, name: 'Sawyer Lindblad', country: 'United States', points: 35970, trend: 0 },
      { rank: 4, name: 'Molly Picklum', country: 'Australia', points: 34865, trend: 0 },
      { rank: 5, name: 'Luana Silva', country: 'Brazil', points: 33835, trend: 0 },
      { rank: 6, name: 'Caitlin Simmers', country: 'United States', points: 31810, trend: 0 },
      { rank: 7, name: 'Lakey Peterson', country: 'United States', points: 30235, trend: 0 },
      { rank: 8, name: 'Erin Brooks', country: 'Canada', points: 29000, trend: 0 },
    ];
  }

  private getDefaultEvents(): WslEvent[] {
    // Datas congeladas refletindo o calendário 2026 real; etapas já disputadas ficam Completed.
    return [
      { name: 'Lexus Trestles Pro', location: 'Lower Trestles, California, EUA', dates: '11-20 Set 2026', status: 'Completed', tour: 'Championship Tour' },
      { name: 'Banco do Brasil Sao Sebastiao Pro', location: 'Sao Sebastiao, Sao Paulo', dates: '26 Set - 3 Out 2026', status: 'Completed', tour: 'Challenger Series' },
      { name: 'MEO Rip Curl Pro Portugal', location: 'Supertubos, Peniche, Portugal', dates: '16-25 Out 2026', status: 'Completed', tour: 'Championship Tour' },
      { name: 'Philippines Pro', location: 'Cloud 9, Siargao Island, Filipinas', dates: '31 Out - 10 Nov 2026', status: 'Completed', tour: 'Championship Tour' },
      { name: 'Lexus Pipe Masters', location: 'Pipeline, Oahu, Hawaii', dates: '8-20 Dez 2026', status: 'Upcoming', tour: 'Championship Tour' },
    ];
  }
}
