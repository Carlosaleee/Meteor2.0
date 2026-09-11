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
  status: 'Completed' | 'Standby' | 'Upcoming';
  tour: string;
};

type WslRankingsResult = {
  men: WslRankingEntry[];
  women: WslRankingEntry[];
  events: WslEvent[];
  fetchedAt: string;
};

@Injectable()
export class WslRepository {
  private readonly logger = new Logger(WslRepository.name);
  private cache: WslRankingsResult | null = null;
  private readonly CACHE_TTL_MS = 30 * 60 * 1000;

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

  private async fetchMenRanking(): Promise<WslRankingEntry[]> {
    try {
      const res = await fetch('https://www.worldsurfleague.com/athletes/tour/mct', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
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
      const res = await fetch('https://www.worldsurfleague.com/athletes/tour/wct', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
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
      const res = await fetch('https://www.worldsurfleague.com/events', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeteorBot/1.0)' },
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
    const entries: WslRankingEntry[] = [];

    const rowRegex = /(\d+)\s*\n\s*([\s\S]*?)\n\s*([\s\S]*?)\n\s*([\s\S]*?)\n\s*([\s\S]*?)\n\s*Total Points/g;
    let match: RegExpExecArray | null;

    while ((match = rowRegex.exec(html)) !== null) {
      const rank = parseInt(match[1], 10);
      if (isNaN(rank) || rank > 35) continue;

      const block = match[0];
      const nameMatch = block.match(/(?:Artboard[\s\S]*?\n\s*){0,2}\s*(?:\d+\s*\n\s*(?:Artboard[\s\S]*?\n\s*){0,2}\s*)*([\w\s.'-]+?)(?:\n|$)/m);
      const pointsMatch = block.match(/(\d{1,3}(?:,\d{3})+)\s*$/m);

      if (nameMatch && pointsMatch) {
        const name = nameMatch[1].trim();
        const points = parseInt(pointsMatch[1].replace(/,/g, ''), 10);
        const country = this.guessCountry(name);
        entries.push({ rank, name, country, points, trend: 0 });
      }
    }

    if (entries.length >= 5) return entries.slice(0, 15);

    return this.parseRankingFallback(html, defaultRanking);
  }

  private parseRankingFallback(html: string, defaultRanking: WslRankingEntry[]): WslRankingEntry[] {
    const entries: WslRankingEntry[] = [];

    const lines = html.split('\n');
    let currentRank = 0;

    for (let i = 0; i < lines.length && entries.length < 15; i++) {
      const line = lines[i].trim();

      const rankMatch = line.match(/^(\d{1,2})$/);
      if (rankMatch) {
        const r = parseInt(rankMatch[1], 10);
        if (r >= 1 && r <= 35) currentRank = r;
        continue;
      }

      if (currentRank > 0 && line.length > 3 && line.length < 40 && !line.match(/^\d/) && !line.includes('Artboard')) {
        const name = line.replace(/\s+/g, ' ').trim();
        if (name && !entries.find(e => e.name === name)) {
          const country = this.guessCountry(name);
          entries.push({ rank: currentRank, name, country, points: 0, trend: 0 });
          currentRank = 0;
        }
      }
    }

    if (entries.length < 5) return defaultRanking;
    return entries;
  }

  private parseEventsHtml(html: string): WslEvent[] {
    const events: WslEvent[] = [];

    const statusRegex = /(Completed|Standby|Upcoming)/g;
    let statusMatch: RegExpExecArray | null;

    while ((statusMatch = statusRegex.exec(html)) !== null) {
      const status = statusMatch[1] as WslEvent['status'];
      const block = html.substring(Math.max(0, statusMatch.index - 500), statusMatch.index + 50);

      const dateMatch = block.match(/([A-Z][a-z]+\s+\d+\s*-\s*[A-Z]?[a-z]*\s*\d+)/);
      const nameMatch = block.match(/(?:Pro|Festival|Classic|Open|Cup)[^<]*/i);

      if (dateMatch) {
        events.push({
          name: nameMatch ? nameMatch[0].trim() : 'WSL Event',
          location: '',
          dates: dateMatch[1].trim(),
          status,
          tour: 'Championship Tour',
        });
      }
    }

    if (events.length >= 2) return events.slice(0, 5);
    return this.getDefaultEvents();
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
      { rank: 3, name: 'Yago Dora', country: 'Brazil', points: 37695, trend: -1 },
      { rank: 4, name: 'Gabriel Medina', country: 'Brazil', points: 35410, trend: 0 },
      { rank: 5, name: 'Miguel Pupo', country: 'Brazil', points: 32770, trend: 0 },
      { rank: 6, name: 'Griffin Colapinto', country: 'United States', points: 31375, trend: 1 },
    ];
  }

  private getDefaultWomenRanking(): WslRankingEntry[] {
    return [
      { rank: 1, name: 'Carissa Moore', country: 'Hawaii', points: 39575, trend: 0 },
      { rank: 2, name: 'Gabriela Bryan', country: 'Hawaii', points: 37065, trend: 0 },
      { rank: 3, name: 'Sawyer Lindblad', country: 'United States', points: 35970, trend: -1 },
      { rank: 4, name: 'Molly Picklum', country: 'Australia', points: 34865, trend: -1 },
      { rank: 5, name: 'Luana Silva', country: 'Brazil', points: 33835, trend: -1 },
      { rank: 6, name: 'Caitlin Simmers', country: 'United States', points: 31810, trend: -1 },
    ];
  }

  private getDefaultEvents(): WslEvent[] {
    return [
      { name: 'Lexus Trestles Pro', location: 'Lower Trestles, California, EUA', dates: '11-20 Set 2026', status: 'Standby', tour: 'Championship Tour' },
      { name: 'Banco do Brasil São Sebastião Pro', location: 'São Sebastião, São Paulo', dates: '26 Set - 3 Out 2026', status: 'Upcoming', tour: 'Challenger Series' },
      { name: 'Circuito Paulista de Base 2026', location: 'Litoral Paulista', dates: 'Set-Nov 2026', status: 'Upcoming', tour: 'Circuito Nacional' },
      { name: 'Longboard Paulista Pro 2026', location: 'Peruíbe, São Paulo', dates: '13 Jun 2026', status: 'Completed', tour: 'Circuito Nacional' },
    ];
  }
}
