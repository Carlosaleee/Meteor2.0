import { Injectable, Logger } from '@nestjs/common';
import { FallbackService } from '../../common/fallback/fallback.service';

const FALLBACK_FILE = 'fallback-noticias-regionais.json';

export type RegionalNewsItem = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  url: string;
  description: string;
  image: string;
  category: 'noticia' | 'transito' | 'policial' | 'turismo' | 'cotidiano';
  publishedAt: string;
};

export type TrafficRoute = {
  id: string;
  name: string;
  condition: string;
  description: string;
  updatedAt: string;
};

export type RegionalNewsResponse = {
  news: RegionalNewsItem[];
  routes: TrafficRoute[];
  timestamp: string;
};

type FileData = { news: RegionalNewsItem[]; routes: TrafficRoute[] };

type RssSource = {
  name: string;
  url: string;
  sourceUrl: string;
};

const RSS_SOURCES: RssSource[] = [
  { name: 'ISN Online', url: 'https://isnonline.com.br/feed', sourceUrl: 'https://isnonline.com.br' },
  { name: 'Santa Portal', url: 'https://santaportal.com.br/feed', sourceUrl: 'https://santaportal.com.br' },
  {
    name: 'Google News',
    url: 'https://news.google.com/rss/search?q=%22Vale%20do%20Ribeira%22&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    sourceUrl: 'https://news.google.com',
  },
];

const MAX_NEWS = 30;
const FETCH_TIMEOUT_MS = 10_000;

@Injectable()
export class NoticiasRegionaisRepository {
  private readonly logger = new Logger(NoticiasRegionaisRepository.name);
  private cache: RegionalNewsResponse | null = null;
  private cacheTs = 0;
  private readonly CACHE_TTL_MS = 30 * 60 * 1000;

  constructor(private readonly fallback: FallbackService) {}

  async forceRefresh(): Promise<void> {
    this.logger.log('Force refreshing regional news...');
    this.cache = null;
    await this.getData();
  }

  async getData(): Promise<RegionalNewsResponse> {
    if (this.cache && Date.now() - this.cacheTs < this.CACHE_TTL_MS) {
      return this.cache;
    }

    const base = await this.loadFile();
    const scraped = await this.fetchAllSources();
    const news = this.mergeNews(scraped, base.news);

    if (scraped.length > 0) {
      await this.fallback.save(FALLBACK_FILE, { news, routes: base.routes });
    }

    const result: RegionalNewsResponse = {
      news,
      routes: base.routes,
      timestamp: new Date().toISOString(),
    };
    this.cache = result;
    this.cacheTs = Date.now();
    return result;
  }

  async getNewsByCategory(category: string): Promise<RegionalNewsItem[]> {
    const data = await this.getData();
    if (category === 'todas') return data.news;
    return data.news.filter(n => n.category === category);
  }

  async getRoutes(): Promise<TrafficRoute[]> {
    const data = await this.getData();
    return data.routes;
  }

  private async loadFile(): Promise<FileData> {
    try {
      const data = await this.fallback.load<FileData>(FALLBACK_FILE);
      return { news: data?.news ?? [], routes: data?.routes ?? [] };
    } catch {
      return { news: [], routes: [] };
    }
  }

  private async fetchAllSources(): Promise<RegionalNewsItem[]> {
    const results = await Promise.all(RSS_SOURCES.map(source => this.fetchSource(source)));
    return results.flat();
  }

  private async fetchSource(source: RssSource): Promise<RegionalNewsItem[]> {
    try {
      const res = await fetch(source.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`${source.name} returned ${res.status}`);
      const xml = await res.text();
      const items = this.parseRss(xml, source);
      this.logger.log(`${source.name}: ${items.length} items`);
      return items;
    } catch (err) {
      this.logger.warn(`Failed to fetch ${source.name}: ${err}`);
      return [];
    }
  }

  private parseRss(xml: string, source: RssSource): RegionalNewsItem[] {
    const items: RegionalNewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = this.stripHtml(this.decodeEntities(this.getTag(block, 'title')));
      const url = this.decodeEntities(this.getTag(block, 'link'));
      const description = this.stripHtml(this.decodeEntities(this.getTag(block, 'description'))).substring(0, 200);
      const pubDate = this.getTag(block, 'pubDate');
      const customSource = this.getTag(block, 'source');
      const image = this.getImage(block);

      if (title.length < 10 || !url.startsWith('http')) continue;

      const date = new Date(pubDate);
      const itemSource = customSource || source.name;

      items.push({
        id: `reg-${this.hashId(title)}`,
        title,
        source: itemSource,
        sourceUrl: source.sourceUrl,
        url,
        description,
        image,
        category: this.classify(title, description),
        publishedAt: isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
      });

      if (items.length >= 15) break;
    }

    return items;
  }

  private getTag(block: string, tag: string): string {
    const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, 'i');
    const match = block.match(regex);
    return match ? match[1].trim() : '';
  }

  private getImage(block: string): string {
    const media = block.match(/<media:content[^>]*url="([^"]+)"/i) || block.match(/<media:thumbnail[^>]*url="([^"]+)"/i) || block.match(/<enclosure[^>]*url="([^"]+)"/i);
    return media ? this.decodeEntities(media[1]) : '';
  }

  private classify(title: string, description: string): RegionalNewsItem['category'] {
    const text = `${title} ${description}`.toLowerCase();
    if (/(transit|interditad|acidente|rodovia|engarrafament|bloquead|sp-\d|br-1|colis|atropel)/.test(text)) return 'transito';
    if (/(policia|roub|furt|assalt|mort[ae]|crime|pris[ãa]o|fuga|tiroteio)/.test(text)) return 'policial';
    if (/(turismo|praia|festival|event|competi[çc][ãa]o|carnaval|ferias|rota)/.test(text)) return 'turismo';
    if (/(escola|sa[úu]de|hospital|feira|saneamento|habita|meio ambiente)/.test(text)) return 'cotidiano';
    return 'noticia';
  }

  private mergeNews(scraped: RegionalNewsItem[], base: RegionalNewsItem[]): RegionalNewsItem[] {
    const seen = new Set<string>();
    const merged: RegionalNewsItem[] = [];

    for (const item of [...scraped, ...base]) {
      const key = this.normalizeTitle(item.title);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }

    merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return merged.slice(0, MAX_NEWS);
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private hashId(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 31 + text.charCodeAt(i)) | 0;
    }
    return (hash >>> 0).toString(36);
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

  private stripHtml(text: string): string {
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
