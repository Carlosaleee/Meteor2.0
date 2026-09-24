import { Test, TestingModule } from '@nestjs/testing';
import { WslRepository } from './wsl.repository';

describe('WslRepository', () => {
  let repository: WslRepository;

  const athleteRow = (rank: number, name: string, country: string, points: string, trendClass = 'positive', trendValue = 1) => `
<tr class="athlete-2656 odd">
  <td class="athlete-rank stat sorted first">${rank}</td>
  <td class="athlete-rank-change"><span class="${trendClass}"><span class="svg svg--triangle-up"></span> ${trendValue}</span></td>
  <td class="athlete-flags-frame "></td>
  <td class="athlete-headshot-and-name">
    <div class="tooltip-item avatar avatar--system">
      <div class="avatar-text-primary"><a href="/athletes/94/${name.toLowerCase().replace(/\s+/g, '-')}">${name}</a></div>
      <div class="avatar-text-secondary"><span class="athlete-country-name">${country}</span></div>
    </div>
  </td>
  <td class="athlete-points athlete-tour-region-year-points stat last"> <span class="tour-points">${points}</span> </td>
</tr>`;

  const mockRankingHtml = `
    <table class="athlete-ranking">
      <tbody>
        ${athleteRow(1, 'Yago Dora', 'Brazil', '42,780', 'positive', 2)}
        ${athleteRow(2, 'Leonardo Fioravanti', 'Italy', '40,015', 'negative', 1)}
        ${athleteRow(3, 'Italo Ferreira', 'Brazil', '39,930')}
        ${athleteRow(4, 'Miguel Pupo', 'Brazil', '39,450')}
        ${athleteRow(5, 'Gabriel Medina', 'Brazil', '35,410')}
        ${athleteRow(6, 'Griffin Colapinto', 'United States', '33,695', 'even', 0)}
      </tbody>
    </table>
  `;

  const mockEventsHtml = `
    <table class="event-schedule">
      <tbody>
        <tr class="event-5277 odd">
          <td class="event-date-range first">Sep 26 - Oct 3</td>
          <td class="event-schedule-details">
            <a class="event-schedule-details__event-name" href="/events/2026/cs/502">Banco do Brasil Sao Sebastiao Pro</a>
            <span class="event-schedule-details__location">Sao Sebastiao, Sao Paulo, Brazil</span>
          </td>
          <td class="event-tour-details"><span class="event-tour-details__tour-name">Challenger Series</span></td>
          <td class="event-tour last"><span class="event-status event-status--upcoming"><span>Upcoming</span></span></td>
        </tr>
        <tr class="event-100 even">
          <td class="event-date-range first">Sep 11 - 20</td>
          <td class="event-schedule-details">
            <a class="event-schedule-details__event-name" href="/events/2026/ct/01">Lexus Trestles Pro</a>
            <span class="event-schedule-details__location">Lower Trestles, California, United States</span>
          </td>
          <td class="event-tour-details"><span class="event-tour-details__tour-name">Championship Tour</span></td>
          <td class="event-tour last"><span class="event-status event-status--completed"><span>Completed</span></span></td>
        </tr>
      </tbody>
    </table>
  `;

  beforeEach(async () => {
    global.fetch = jest.fn().mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(String(url).includes('events') ? mockEventsHtml : mockRankingHtml),
        json: () => Promise.resolve([]),
      }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [WslRepository],
    }).compile();

    repository = module.get<WslRepository>(WslRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getRankings', () => {
    it('should parse real WSL table rows with rank, name, country and points', async () => {
      const result = await repository.getRankings();
      expect(result.men).toHaveLength(6);
      expect(result.men[0]).toEqual({
        rank: 1,
        name: 'Yago Dora',
        country: 'Brazil',
        points: 42780,
        trend: 2,
      });
      expect(result.men[1].name).toBe('Leonardo Fioravanti');
      expect(result.men[1].country).toBe('Italy');
      expect(result.men[1].points).toBe(40015);
      expect(result.men[1].trend).toBe(-1);
      expect(result.men[5].trend).toBe(0);
      expect(result.women).toHaveLength(6);
    });

    it('should parse events from the real events table', async () => {
      const result = await repository.getRankings();
      expect(result.events).toHaveLength(2);
      expect(result.events[0]).toEqual({
        name: 'Banco do Brasil Sao Sebastiao Pro',
        location: 'Sao Sebastiao, Sao Paulo, Brazil',
        dates: 'Sep 26 - Oct 3',
        status: 'Upcoming',
        tour: 'Challenger Series',
      });
      expect(result.events[1].status).toBe('Completed');
    });

    it('should fall back to defaults when page markup is unrecognizable', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('<html><body>Blocked</body></html>'),
        json: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.getRankings();
      expect(result.men[0].name).toBe('Leonardo Fioravanti');
      expect(result.women[0].name).toBe('Carissa Moore');
      expect(result.events[0].name).toBe('Lexus Trestles Pro');
    });

    it('should fall back to defaults when fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

      const result = await repository.getRankings();
      expect(result.men[0].name).toBe('Leonardo Fioravanti');
      expect(result.fetchedAt).toBeDefined();
    });

    it('should cache results', async () => {
      const result1 = await repository.getRankings();
      const result2 = await repository.getRankings();
      expect(result1).toBe(result2);
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      await repository.getRankings();
      repository.clearCache();
      const result = await repository.getRankings();
      expect(result).toBeDefined();
      expect(result.fetchedAt).toBeDefined();
    });
  });
});
