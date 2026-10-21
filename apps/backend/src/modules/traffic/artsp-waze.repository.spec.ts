import { Test, TestingModule } from '@nestjs/testing';
import { ArtspWazeRepository } from './artsp-waze.repository';

describe('ArtspWazeRepository', () => {
  let repository: ArtspWazeRepository;

  const panelHtml = `
    <html><body>
    <div class="hidden" id="text__tempo-viagem">
        *REGISTROS DE LENTIDÃO*<br />
        _Cobertura: Estado de São Paulo_<br />
        _Coletado em 21/10/2026 17:48_<br />
        Atraso total | Extensão total<br />
        📍*: _8h 47min_ | _174,7 km_<br />
        📍*SP 055*: _40 min_ | _24,3 km_<br />
        📍*SP 320*: interd. ou sem inf. | _1,1 km_<br />
        📍*SP 222*: interd. ou sem inf. | _206 m_<br />
    </div>
    <div data-trafego-card data-rodovia="SP 222" data-local="ROD. JOSÉ REDIS" data-nivel="5">N5</div>
    <div data-trafego-card data-rodovia="SP 055" data-local="ROD. ELISEU MATHEUS" data-nivel="3">N3</div>
    </body></html>
  `;

  const panelResponse = { ok: true, text: jest.fn().mockResolvedValue(panelHtml) };

  const apiResult = (overrides: Record<string, unknown> = {}) => ({
    ok: true,
    json: jest.fn().mockResolvedValue({
      results: [
        {
          classe: 'Acidente',
          rodovia: { slug: 'sp-165', nome: 'SP-165' },
          km_inicial: 88,
          km_final: 89,
          atualizado_em: '2026-10-21T18:00:00-03:00',
          interdicoes: [],
          ...overrides,
        },
      ],
    }),
  });

  const mockFetchByRoute = (panel: unknown, api?: unknown) => {
    global.fetch = jest.fn().mockImplementation((url: string) =>
      Promise.resolve(String(url).includes('/rodovias/api/ocorrencias') && api ? api : panel),
    );
  };

  beforeEach(async () => {
    delete process.env.ARTESP_API_KEY;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtspWazeRepository],
    }).compile();

    repository = module.get<ArtspWazeRepository>(ArtspWazeRepository);
  });

  afterEach(() => {
    delete process.env.ARTESP_API_KEY;
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('painel Waze publico', () => {
    it('should map summary entries and card levels to conditions per tracked road', async () => {
      mockFetchByRoute(panelResponse);

      const result = await repository.getLiveRoutes();

      expect(result).not.toBeNull();
      expect(result!.sourceUrl).toBe('https://ccm.artesp.sp.gov.br/rodovias/waze');
      expect(result!.routes['sp-222']).toEqual({
        condition: 'BLOQUEADO',
        description: 'Interdição ou sem dados de tráfego — 206 m',
        updatedAt: '2026-10-21T17:48:00-03:00',
      });
      // 40 min -> MODERADO no resumo; card N3 tambem MODERADO
      expect(result!.routes['sp-055'].condition).toBe('MODERADO');
      expect(result!.routes['sp-055'].description).toContain('Lentidão');
    });

    it('should report roads absent from the summary as LIVRE with panel timestamp', async () => {
      mockFetchByRoute(panelResponse);

      const result = await repository.getLiveRoutes();

      expect(result!.routes['sp-165']).toEqual({
        condition: 'LIVRE',
        description: 'Sem lentidão reportada no Waze (painel CCM/ARTESP)',
        updatedAt: '2026-10-21T17:48:00-03:00',
      });
    });

    it('should escalate to BLOQUEADO when a card reports nivel 5', async () => {
      const html = `
        <div class="hidden" id="text__tempo-viagem">
            *REGISTROS DE LENTIDÃO*<br />
            _Coletado em 21/10/2026 17:48_<br />
            📍*SP 165*: _1h 54min_ | _45,6 km_<br />
        </div>
        <div data-trafego-card data-rodovia="SP 165" data-local="ELDORADO" data-nivel="5">N5</div>
      `;
      mockFetchByRoute({ ok: true, text: jest.fn().mockResolvedValue(html) });

      const result = await repository.getLiveRoutes();

      expect(result!.routes['sp-165'].condition).toBe('BLOQUEADO');
      expect(result!.routes['sp-165'].description).toBe('Via bloqueada (N5) — ELDORADO');
    });

    it('should parse delays over one hour as LENTO', async () => {
      const html = `
        <div class="hidden" id="text__tempo-viagem">
            _Coletado em 21/10/2026 17:48_<br />
            📍*SP 055*: _1h 54min_ | _45,6 km_<br />
        </div>
      `;
      mockFetchByRoute({ ok: true, text: jest.fn().mockResolvedValue(html) });

      const result = await repository.getLiveRoutes();

      expect(result!.routes['sp-055'].condition).toBe('LENTO');
      expect(result!.routes['sp-055'].description).toBe('Lentidão de 1h 54min — 45,6 km');
    });

    it('should return null when the panel has no recognizable summary block', async () => {
      mockFetchByRoute({ ok: true, text: jest.fn().mockResolvedValue('<html><body>Blocked</body></html>') });

      await expect(repository.getLiveRoutes()).resolves.toBeNull();
    });

    it('should return null when the fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

      await expect(repository.getLiveRoutes()).resolves.toBeNull();
    });

    it('should cache the live result between calls', async () => {
      mockFetchByRoute(panelResponse);

      await repository.getLiveRoutes();
      await repository.getLiveRoutes();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should refetch after clearCache', async () => {
      mockFetchByRoute(panelResponse);

      await repository.getLiveRoutes();
      repository.clearCache();
      await repository.getLiveRoutes();

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('API oficial opcional (ARTESP_API_KEY)', () => {
    it('should not call the official API when the key is not configured', async () => {
      mockFetchByRoute(panelResponse);

      await repository.getLiveRoutes();

      const urls = (global.fetch as jest.Mock).mock.calls.map(c => String(c[0]));
      expect(urls.some(u => u.includes('/rodovias/api/ocorrencias'))).toBe(false);
    });

    it('should merge active occurrences from the official API over panel data', async () => {
      process.env.ARTESP_API_KEY = 'cci_test_key';
      mockFetchByRoute(panelResponse, apiResult());

      const result = await repository.getLiveRoutes();

      expect(result!.routes['sp-165'].condition).toBe('MODERADO');
      expect(result!.routes['sp-165'].description).toBe('Acidente ativa km 88–89');
      expect(result!.routes['sp-165'].updatedAt).toBe('2026-10-21T18:00:00-03:00');
      // Dado do painel permanece para as demais rodovias
      expect(result!.routes['sp-222'].condition).toBe('BLOQUEADO');
    });

    it('should map occurrences with interdicoes to BLOQUEADO', async () => {
      process.env.ARTESP_API_KEY = 'cci_test_key';
      mockFetchByRoute(panelResponse, apiResult({ interdicoes: [{ faixa: 1 }] }));

      const result = await repository.getLiveRoutes();

      expect(result!.routes['sp-165'].condition).toBe('BLOQUEADO');
      expect(result!.routes['sp-165'].description).toBe('Interdição ativa — Acidente km 88–89');
    });

    it('should keep panel data when the official API fails', async () => {
      process.env.ARTESP_API_KEY = 'cci_test_key';
      mockFetchByRoute(panelResponse, { ok: false, status: 403, json: jest.fn() });

      const result = await repository.getLiveRoutes();

      expect(result!.routes['sp-222'].condition).toBe('BLOQUEADO');
      expect(result!.routes['sp-165'].condition).toBe('LIVRE');
    });

    it('should build routes from the API alone when the panel fails', async () => {
      process.env.ARTESP_API_KEY = 'cci_test_key';
      mockFetchByRoute({ ok: false, status: 500, text: jest.fn() }, apiResult());

      const result = await repository.getLiveRoutes();

      expect(result!.routes['sp-165'].condition).toBe('MODERADO');
      expect(result!.routes['sp-222']).toEqual({
        condition: 'LIVRE',
        description: 'Sem ocorrência ativa registrada no CCM/ARTESP',
        updatedAt: expect.any(String),
      });
    });
  });
});
