import { Test, TestingModule } from '@nestjs/testing';
import { WslRepository } from './wsl.repository';

describe('WslRepository', () => {
  let repository: WslRepository;

  const athleteRow = (
    rank: number,
    name: string,
    country: string,
    points: string,
    trendClass = 'positive',
    trendValue = 1,
    pointsClass = '',
  ) => `
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
  <td class="athlete-points athlete-live-event-points stat last"> <span class="tour-points${pointsClass}">${points}</span> </td>
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

    it('should parse athletes whose points span carries the eliminated class', async () => {
      const rows = [
        athleteRow(1, 'Yago Dora', 'Brazil', '47,525'),
        athleteRow(2, 'Italo Ferreira', 'Brazil', '44,675', 'positive', 1, ' eliminated'),
        athleteRow(3, 'Filipe Toledo', 'Brazil', '42,770', 'negative', 2, ' eliminated'),
        athleteRow(4, 'Ethan Ewing', 'Australia', '38,440', 'even', 0, ' eliminated'),
        athleteRow(5, 'Samuel Pupo', 'Brazil', '35,640', 'negative', 1, ' eliminated'),
        athleteRow(6, 'Morgan Cibilic', 'Australia', '24,610'),
      ].join('');

      global.fetch = jest.fn().mockImplementation((url: string) =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(String(url).includes('events') ? mockEventsHtml : rows),
          json: () => Promise.resolve([]),
        }),
      );

      const result = await repository.getRankings();
      expect(result.men).toHaveLength(6);
      expect(result.men.map(m => m.rank)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.men[4]).toEqual({
        rank: 5,
        name: 'Samuel Pupo',
        country: 'Brazil',
        points: 35640,
        trend: -1,
      });
    });

    it('should parse event names that contain sponsor markup', async () => {
      const eventsHtml = `
        <tr class="event-500 odd">
          <td class="event-date-range first">Oct 6 - 12</td>
          <td class="event-schedule-details">
            <a class="event-schedule-details__event-name" href="/events/2026/cs/500">EDP Ericeira Pro<span class="event-schedule-details__sponsor"><span class="event-schedule-details__sponsor__name">Xacobeo</span></span></a>
            <span class="event-schedule-details__location">Ribeira D'Ilhas, Ericeira, Portugal</span>
          </td>
          <td class="event-tour-details"><span class="event-tour-details__tour-name">Challenger Series</span></td>
          <td class="event-tour last"><span class="event-status event-status--upcoming"><span>Upcoming</span></span></td>
        </tr>
        <tr class="event-501 even">
          <td class="event-date-range first">Oct 16 - 25</td>
          <td class="event-schedule-details">
            <a class="event-schedule-details__event-name" href="/events/2026/ct/10">MEO Rip Curl Pro Portugal<span class="event-schedule-details__sponsor"><span class="event-schedule-details__sponsor__name">Corona Cero</span></span></a>
            <span class="event-schedule-details__location">Supertubos, Peniche, Portugal</span>
          </td>
          <td class="event-tour-details"><span class="event-tour-details__tour-name">Championship Tour</span></td>
          <td class="event-tour last"><span class="event-status event-status--upcoming"><span>Upcoming</span></span></td>
        </tr>
      `;

      global.fetch = jest.fn().mockImplementation((url: string) =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(String(url).includes('events') ? eventsHtml : mockRankingHtml),
          json: () => Promise.resolve([]),
        }),
      );

      const result = await repository.getRankings();
      expect(result.events).toHaveLength(2);
      expect(result.events[0].name).toBe('EDP Ericeira Pro');
      expect(result.events[0].location).toBe("Ribeira D'Ilhas, Ericeira, Portugal");
      expect(result.events[1].name).toBe('MEO Rip Curl Pro Portugal');
    });
  });

  describe('getNews', () => {
    const newsHtml = `
      <div class="content-card-wrap">
        <div class="promotion-card content-card" data-content-id="562076" data-content-type="article">
          <div class="content-card-bd link" data-href="/posts/562076/finals-day-all-set">
            <div class="content-card-img-wrap">
              <div class="content-card-img proxy-img" data-img-src="https://d3qf8nvav5av0u.cloudfront.net/image/abc.jpg?&x=400"></div>
            </div>
            <div class="content-card-text-wrap">
              <div class="content-card-meta">
                <time pubdate class="content-card-pubdate" datetime="2026-10-17 09:41:00">Saturday, October 17, 2026</time>
              </div>
              <a class="content-card-title promotion-card-title" href="/posts/562076/finals-day-all-set"><span class="truncate">Finals Day All Set For Tomorrow At Edommo Surf Pro</span></a>
              <p class="content-card-description"> Semifinals locked in! </p>
            </div>
          </div>
        </div>
      </div>
    `;

    it('should parse article cards from the WSL news page', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(newsHtml),
        json: jest.fn().mockResolvedValue([]),
      });

      const news = await repository.getNews();
      expect(news).toHaveLength(1);
      expect(news[0]).toEqual({
        title: 'Finals Day All Set For Tomorrow At Edommo Surf Pro',
        description: 'Semifinals locked in!',
        url: 'https://www.worldsurfleague.com/posts/562076/finals-day-all-set',
        image: 'https://d3qf8nvav5av0u.cloudfront.net/image/abc.jpg?&x=400',
        publishedAt: expect.any(String),
      });
      expect(new Date(news[0].publishedAt).getFullYear()).toBe(2026);
    });

    it('should return an empty list when the news page has no cards', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('<html><body>Blocked</body></html>'),
        json: jest.fn().mockResolvedValue([]),
      });

      await expect(repository.getNews()).resolves.toEqual([]);
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
