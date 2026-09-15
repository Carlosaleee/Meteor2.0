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
        title: 'Hang Loose Surf Attack 2026 — 288 vagas record na 33a edicao em Maresias',
        description: 'Maior premiacao da historia com R$ 50 mil. Evento de 30/09 a 03/10 na Praia de Camburi, Sao Sebastiao. Categorias Sub12 a Sub18.',
        url: 'https://www.spsurf.com.br/hangloosesurfattack',
        publishedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
        image: '',
      },
      {
        title: 'Rip Curl GromSearch Maresias 2026 reune nova geracao do surf brasileiro',
        description: 'Arthur Vilar e Isabel Meyer classificados para final internacional na Australia. Evento com excelentes condicoes de onda em Maresias.',
        url: 'https://blog.ripcurl.com.br/2026/09/10/rip-curl-gromsearch-maresias-2026-reune-a-nova-geracao-do-surf-brasileiro/',
        publishedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
        image: '',
      },
      {
        title: 'Circuito Santos de Surf 2026 coroa campeoes em nove categorias',
        description: 'Cerca de 90 surfistas disputaram titulos no Novo Quebra-Mar. Bruno Franca campeao Open Masculino, Isabelly Knut dupla campia.',
        url: 'https://jornaldaorla.com.br/noticias/circuito-santos-de-surf-2026-coroa-campeoes-em-nove-categorias/',
        publishedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
        image: '',
      },
      {
        title: 'SPSurf passa a ser nova entidade reguladora do surfe em Sao Paulo',
        description: 'Com apoio de 12 das 15 associacoes do litoral paulista, SPSurf assume a regulacao do surfe profissional e amador.',
        url: 'https://www.spsurf.com.br',
        publishedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
        image: '',
      },
      {
        title: 'Banco do Brasil Sao Sebastiao Pro — WSL chega ao litoral paulista pela 1a vez',
        description: 'Etapa do Challenger Series em Sao Sebastiao de 26/09 a 03/10 na Praia de Maresias. Evento historico para o surfe paulista.',
        url: 'https://www.terra.com.br/esportes/surfe/berco-de-gabriel-medina-litoral-de-sp-recebe-etapa-mundial-da-wsl-pela-primeira-vez',
        publishedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
        image: '',
      },
      {
        title: 'Longboard Paulista Pro 2026 sera realizado em Peruibe',
        description: 'A cidade de Peruibe recebe o Longboard Paulista Pro 2026, competicao das categorias Masculino e Feminino.',
        url: 'https://www.spsurf.com.br',
        publishedAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
        image: '',
      },
    ];
  }
}
