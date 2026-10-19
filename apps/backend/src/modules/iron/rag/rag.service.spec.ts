import { Test, TestingModule } from '@nestjs/testing';
import { FallbackService } from '../../../common/fallback/fallback.service';
import { GeminiClientService } from '../../../common/ai/gemini-client.service';
import { RagService } from './rag.service';
import { IndexStore } from './index.store';
import type { RagIndex } from './rag.types';

describe('RagService', () => {
  let service: RagService;

  const mockStore = {
    loadDocsIndex: jest.fn<Promise<RagIndex | null>, []>().mockResolvedValue(null),
    loadDataIndex: jest.fn<Promise<RagIndex | null>, []>().mockResolvedValue(null),
    saveDataIndex: jest.fn<Promise<void>, [RagIndex]>().mockResolvedValue(undefined),
  };

  const mockFallback = {
    load: jest.fn<Promise<unknown | null>, [string]>().mockResolvedValue(null),
  };

  const mockGemini = {
    embed: jest.fn<Promise<number[] | null>, [string]>().mockResolvedValue(null),
    embedBatch: jest.fn<Promise<(number[] | null)[]>, [string[]]>().mockResolvedValue([]),
    generateText: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagService,
        { provide: IndexStore, useValue: mockStore },
        { provide: FallbackService, useValue: mockFallback },
        { provide: GeminiClientService, useValue: mockGemini },
      ],
    }).compile();

    service = module.get<RagService>(RagService);
    jest.clearAllMocks();
    mockStore.loadDocsIndex.mockResolvedValue(null);
    mockStore.loadDataIndex.mockResolvedValue(null);
    mockStore.saveDataIndex.mockResolvedValue(undefined);
    mockFallback.load.mockResolvedValue(null);
    mockGemini.embed.mockResolvedValue(null);
    mockGemini.embedBatch.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('retrieve', () => {
    const docsIndex: RagIndex = {
      version: 1,
      builtAt: '2026-10-19T00:00:00.000Z',
      source: 'docs',
      chunks: [
        { id: 'docs:1', title: 'SYSTEM_SPEC.md', section: 'Clima', text: 'previsão do tempo com ondas swell vento', source: 'docs' },
        { id: 'docs:2', title: 'SYSTEM_SPEC.md', section: 'Trânsito', text: 'rodovias SP-222 BR-116 balsa trânsito', source: 'docs' },
      ],
    };

    it('should return BM25-only hits when embeddings unavailable', async () => {
      mockStore.loadDocsIndex.mockResolvedValue(docsIndex);

      const hits = await service.retrieve('ondas swell');
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0].chunk.id).toBe('docs:1');
    });

    it('should combine semantic cosine when query and chunk embeddings exist', async () => {
      const withEmbeddings: RagIndex = {
        ...docsIndex,
        chunks: [
          { id: 'docs:1', title: 'A', text: 'alpha beta gamma delta', source: 'docs' },
          { id: 'docs:2', title: 'B', text: 'alpha beta gamma delta', source: 'docs' },
        ],
        embeddings: {
          docs: [1, 0, 0],
          docs2: [0, 1, 0],
        },
      };
      mockStore.loadDocsIndex.mockResolvedValue(withEmbeddings);
      mockGemini.embed.mockResolvedValue([1, 0, 0]);

      const hits = await service.retrieve('alpha beta gamma delta');
      expect(hits[0].chunk.id).toBe('docs:1');
    });

    it('should return empty when there are no indexes', async () => {
      const hits = await service.retrieve('qualquer coisa');
      expect(hits).toEqual([]);
    });

    it('should merge docs and data chunks', async () => {
      mockStore.loadDocsIndex.mockResolvedValue({
        version: 1, builtAt: '', source: 'docs',
        chunks: [{ id: 'docs:1', title: 'Doc', text: 'informação do documento sobre maré', source: 'docs' }],
      });
      mockStore.loadDataIndex.mockResolvedValue({
        version: 1, builtAt: '', source: 'data',
        chunks: [{ id: 'data:1', title: 'Dados', text: 'maré alta às 14:30 em Ilha Comprida', source: 'data' }],
      });

      const hits = await service.retrieve('maré');
      expect(hits.length).toBe(2);
    });
  });

  describe('rebuildDataIndex', () => {
    it('should build, embed and save chunks from fallback files', async () => {
      mockFallback.load.mockImplementation(async (file: string) =>
        file === 'fallback-meteorology.json'
          ? { locations: { 'ilha-comprida': { current: { temperature_2m: 25 } } } }
          : null,
      );
      mockGemini.embedBatch.mockImplementation(async (texts: string[]) => texts.map(() => [0.1, 0.2, 0.3]));

      const result = await service.rebuildDataIndex();
      expect(result?.chunks).toBeGreaterThan(0);
      expect(result?.embedded).toBe(result?.chunks);

      const saved = mockStore.saveDataIndex.mock.calls[0][0];
      expect(saved.source).toBe('data');
      expect(saved.chunks[0].text).toContain('temperature_2m: 25');
      expect(saved.embeddings?.[saved.chunks[0].id]).toEqual([0.1, 0.2, 0.3]);
    });

    it('should still save a lexical index when embedding fails', async () => {
      mockFallback.load.mockResolvedValue({ any: 'data' });
      mockGemini.embedBatch.mockResolvedValue([null]);

      const result = await service.rebuildDataIndex();
      expect(result?.chunks).toBeGreaterThan(0);
      expect(result?.embedded).toBe(0);

      const saved = mockStore.saveDataIndex.mock.calls[0][0];
      expect(saved.embeddings).toBeUndefined();
    });

    it('should return null when no fallback data exists', async () => {
      mockFallback.load.mockResolvedValue(null);
      const result = await service.rebuildDataIndex();
      expect(result).toBeNull();
      expect(mockStore.saveDataIndex).not.toHaveBeenCalled();
    });
  });
});
