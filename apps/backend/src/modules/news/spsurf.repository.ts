import { Injectable, Logger } from '@nestjs/common';

export type SpsurfNewsItem = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  image: string;
};

@Injectable()
export class SpsurfRepository {
  private readonly logger = new Logger(SpsurfRepository.name);
  private cache: SpsurfNewsItem[] | null = null;
  private cacheTs = 0;
  private readonly CACHE_TTL_MS = 30 * 60 * 1000;

  async getNews(): Promise<SpsurfNewsItem[]> {
    if (this.cache && Date.now() - this.cacheTs < this.CACHE_TTL_MS) {
      return this.cache;
    }

    try {
      const res = await fetch('https://www.spsurf.com.br', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
      });
      if (!res.ok) throw new Error(`SPSurf returned ${res.status}`);
      const html = await res.text();
      const news = this.parseHtml(html);

      if (news.length > 0) {
        this.cache = news;
        this.cacheTs = Date.now();
        return news;
      }
    } catch (err) {
      this.logger.warn(`Failed to fetch SPSurf news: ${err}`);
    }

    return this.getDefaultNews();
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

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
  }

  private resolveUrl(href: string): string {
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    return `https://www.spsurf.com.br${href.startsWith('/') ? '' : '/'}${href}`;
  }

  private getDefaultNews(): SpsurfNewsItem[] {
    const now = new Date();
    return [
      {
        title: 'Longboard Paulista Pro 2026 será realizado em Peruíbe',
        description: 'A cidade de Peruíbe recebe, no dia 13 de junho de 2026, o Longboard Paulista Pro 2026, competição das categorias Masculino e Feminino.',
        url: 'https://www.spsurf.com.br',
        publishedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
        image: '',
      },
      {
        title: 'Ondas pesadas e novos talentos marcam o Hang Loose Surf Attack 2026 no Guarujá',
        description: 'Primeira etapa do circuito definiu os atletas classificados para representar São Paulo no CBSurf de Base 2026.',
        url: 'https://www.spsurf.com.br',
        publishedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
        image: '',
      },
      {
        title: 'Vini Palma e Eduarda Stefani vencem e dominam as ondas da Praia da Baleia',
        description: 'Surfistas dominam as categorias Sub14 no Circuito Paulista EDP de Surf Colegial 2025.',
        url: 'https://www.spsurf.com.br',
        publishedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
        image: '',
      },
      {
        title: 'SPSurf passa a ser a nova entidade reguladora do surfe em São Paulo',
        description: 'Com apoio de 12 das 15 associações do litoral paulista, SPSurf assume a regulação do surfe profissional e amador.',
        url: 'https://www.spsurf.com.br',
        publishedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
        image: '',
      },
      {
        title: '100% Surf — O surfe competição de SP ganha novo impulso',
        description: 'A Federação de Surf do Estado de São Paulo agora é liderada pelo ex-surfista profissional José Paulo Neves Ferreira.',
        url: 'https://www.spsurf.com.br',
        publishedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
        image: '',
      },
      {
        title: 'Circuito Paulista de Base 2026 — Calendário divulgado',
        description: 'Novas etapas confirmadas para o litoral paulista com foco na formação de atletas juvenis.',
        url: 'https://www.spsurf.com.br',
        publishedAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
        image: '',
      },
    ];
  }
}
