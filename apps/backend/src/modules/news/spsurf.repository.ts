import { Injectable, Logger } from '@nestjs/common';
import { isPortuguese } from '../../common/text/language';

export type SpsurfNewsItem = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  image: string;
};

const PRIMARY_URL = 'https://www.spsurf.com.br';
const GOOGLE_NEWS_RSS =
  'https://news.google.com/rss/search?q=surfe%20OR%20surfista%20OR%20%22circuito%20de%20surfe%22%20when:7d&hl=pt-BR&gl=BR&ceid=BR:pt-419';
const FETCH_TIMEOUT_MS = 15_000;
const SURF_KEYWORDS = /surfe|surfista|surf|prancha|swell|onda|wsl|grom|shortboard|longboard/i;
const OFF_TOPIC = /\b(mvno|telecom|telefonia|banda larga|operadora|aplicativo)/i;

@Injectable()
export class SpsurfRepository {
  private readonly logger = new Logger(SpsurfRepository.name);
  private cache: SpsurfNewsItem[] | null = null;
  private cacheTs = 0;
  private readonly CACHE_TTL_MS = 30 * 60 * 1000;

  clearCache(): void {
    this.cache = null;
  }

  async getNews(): Promise<SpsurfNewsItem[]> {
    if (this.cache && Date.now() - this.cacheTs < this.CACHE_TTL_MS) {
      return this.cache;
    }

    const news = (await this.fetchPrimary()) ?? (await this.fetchGoogleNews());
    if (news.length > 0) {
      this.cache = news;
      this.cacheTs = Date.now();
      return news;
    }

    return this.getDefaultNews();
  }

  private async fetchPrimary(): Promise<SpsurfNewsItem[] | null> {
    try {
      const res = await fetch(PRIMARY_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`SPSurf returned ${res.status}`);
      const news = this.parseHtml(await res.text());
      if (news.length > 0) return news;
      this.logger.warn('SPSurf returned no recognizable items');
    } catch (err) {
      this.logger.warn(`Failed to fetch SPSurf news: ${err}`);
    }
    return null;
  }

  private async fetchGoogleNews(): Promise<SpsurfNewsItem[]> {
    try {
      const res = await fetch(GOOGLE_NEWS_RSS, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`Google News RSS returned ${res.status}`);
      const items = this.parseRss(await res.text());
      this.logger.log(`Google News RSS: ${items.length} surf items`);
      return items;
    } catch (err) {
      this.logger.warn(`Failed to fetch Google News RSS: ${err}`);
      return [];
    }
  }

  private parseRss(xml: string): SpsurfNewsItem[] {
    const items: SpsurfNewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const outlet = this.decodeEntities(this.getTag(block, 'source'));
      let title = this.stripHtml(this.decodeEntities(this.getTag(block, 'title')));
      if (outlet && title.endsWith(` - ${outlet}`)) title = title.slice(0, -(outlet.length + 3));
      const url = this.decodeEntities(this.getTag(block, 'link'));
      const pubDate = this.getTag(block, 'pubDate');

      if (title.length < 10 || !url.startsWith('http')) continue;
      if (!SURF_KEYWORDS.test(title) || OFF_TOPIC.test(title)) continue;

      // Google News devolve materia em ingles/espanhol mesmo com hl=pt-BR.
      const description = this.stripHtml(this.decodeEntities(this.getTag(block, 'description'))).substring(0, 200);
      if (!isPortuguese(`${title} ${description}`)) continue;

      const date = new Date(pubDate);
      items.push({
        title,
        description,
        url,
        publishedAt: isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
        image: '',
      });

      if (items.length >= 6) break;
    }

    return items;
  }

  private getTag(block: string, tag: string): string {
    const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, 'i');
    const match = block.match(regex);
    return match ? match[1].trim() : '';
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

  private parseHtml(html: string): SpsurfNewsItem[] {
    const items: SpsurfNewsItem[] = [];

    const titleRegex = /<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi;
    let titleMatch: RegExpExecArray | null;

    while ((titleMatch = titleRegex.exec(html)) !== null) {
      const title = this.stripHtml(titleMatch[1]).trim();
      if (title.length < 10 || title.length > 200) continue;
      if (title.includes('Menu') || title.includes('HOME') || title.includes('Contato')) continue;

      const startIdx = titleMatch.index;
      const block = html.substring(startIdx, Math.min(startIdx + 2000, html.length));

      const linkMatch = block.match(/href="([^"]*spsurf[^"]*)"/i);
      const imgMatch = block.match(/src="([^"]*\.(jpg|jpeg|png|webp)[^"]*)"/i);
      const descMatch = block.match(/<p[^>]*>(.*?)<\/p>/is);

      const url = linkMatch ? this.resolveUrl(linkMatch[1]) : 'https://www.spsurf.com.br';
      const image = imgMatch ? this.resolveUrl(imgMatch[1]) : '';
      const description = descMatch ? this.stripHtml(descMatch[1]).trim().substring(0, 200) : '';

      if (title && !items.find(i => i.title === title)) {
        items.push({
          title,
          description,
          url,
          publishedAt: new Date().toISOString(),
          image,
        });
      }

      if (items.length >= 6) break;
    }

    return items;
  }

  private stripHtml(text: string): string {
    return this.decodeEntities(text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')).trim();
  }

  private resolveUrl(href: string): string {
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    return `https://www.spsurf.com.br${href.startsWith('/') ? '' : '/'}${href}`;
  }

  /**
   * Notícias de EXEMPLO com datas CONGELADas (set/2026) — nunca relativas:
   * datas relativas passariam por frescor real e sempre passariam no filtro de 7 dias.
   */
  private getDefaultNews(): SpsurfNewsItem[] {
    return [
      {
        title: 'Hang Loose Surf Attack 2026 — 288 vagas record na 33a edicao em Maresias',
        description: 'Maior premiacao da historia com R$ 50 mil. Evento de 30/09 a 03/10 na Praia de Camburi, Sao Sebastiao. Categorias Sub12 a Sub18.',
        url: 'https://www.spsurf.com.br/hangloosesurfattack',
        publishedAt: '2026-09-15T12:00:00.000Z',
        image: '',
      },
      {
        title: 'Rip Curl GromSearch Maresias 2026 reune nova geracao do surf brasileiro',
        description: 'Arthur Vilar e Isabel Meyer classificados para final internacional na Australia. Evento com excelentes condicoes de onda em Maresias.',
        url: 'https://blog.ripcurl.com.br/2026/09/10/rip-curl-gromsearch-maresias-2026-reune-a-nova-geracao-do-surf-brasileiro/',
        publishedAt: '2026-09-11T12:00:00.000Z',
        image: '',
      },
      {
        title: 'Circuito Santos de Surf 2026 coroa campeoes em nove categorias',
        description: 'Cerca de 90 surfistas disputaram titulos no Novo Quebra-Mar. Bruno Franca campeao Open Masculino, Isabelly Knut dupla campia.',
        url: 'https://jornaldaorla.com.br/noticias/circuito-santos-de-surf-2026-coroa-campeoes-em-nove-categorias/',
        publishedAt: '2026-09-08T12:00:00.000Z',
        image: '',
      },
      {
        title: 'SPSurf passa a ser nova entidade reguladora do surfe em Sao Paulo',
        description: 'Com apoio de 12 das 15 associacoes do litoral paulista, SPSurf assume a regulacao do surfe profissional e amador.',
        url: 'https://www.spsurf.com.br',
        publishedAt: '2026-09-05T12:00:00.000Z',
        image: '',
      },
      {
        title: 'Banco do Brasil Sao Sebastiao Pro — WSL chega ao litoral paulista pela 1a vez',
        description: 'Etapa do Challenger Series em Sao Sebastiao de 26/09 a 03/10 na Praia de Maresias. Evento historico para o surfe paulista.',
        url: 'https://www.terra.com.br/esportes/surfe/berco-de-gabriel-medina-litoral-de-sp-recebe-etapa-mundial-da-wsl-pela-primeira-vez',
        publishedAt: '2026-09-14T12:00:00.000Z',
        image: '',
      },
      {
        title: 'Longboard Paulista Pro 2026 sera realizado em Peruibe',
        description: 'A cidade de Peruibe recebe o Longboard Paulista Pro 2026, competicao das categorias Masculino e Feminino.',
        url: 'https://www.spsurf.com.br',
        publishedAt: '2026-09-03T12:00:00.000Z',
        image: '',
      },
    ];
  }
}
