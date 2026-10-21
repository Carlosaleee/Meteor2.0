import { GeminiClientService } from './gemini-client.service';

describe('GeminiClientService', () => {
  const configMock = {
    get: jest.fn((key: string) => {
      if (key === 'GEMINI_API_KEY') return 'test-key';
      if (key === 'GEMINI_MODEL') return 'gemini-test';
      return undefined;
    }),
  };

  let service: GeminiClientService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GeminiClientService(configMock as never);
  });

  describe('generateText timeout', () => {
    it('should return null when the API responds after the 45s timeout', async () => {
      jest.useFakeTimers();
      try {
        // Cliente que nunca resolve (simula API travada).
        (service as unknown as { getClient: () => unknown }).getClient = () => ({
          models: {
            generateContent: () => new Promise(() => undefined),
          },
        });

        const promise = service.generateText({ prompt: 'olá' });
        // Avança além do timeout de 45s.
        await jest.advanceTimersByTimeAsync(45_001);
        await expect(promise).resolves.toBeNull();
      } finally {
        jest.useRealTimers();
      }
    });

    it('should return the text when the API responds within the timeout', async () => {
      (service as unknown as { getClient: () => unknown }).getClient = () => ({
        models: {
          generateContent: () => Promise.resolve({ text: 'resposta ok  ' }),
        },
      });

      await expect(service.generateText({ prompt: 'olá' })).resolves.toBe('resposta ok');
    });

    it('should return null when the API throws', async () => {
      (service as unknown as { getClient: () => unknown }).getClient = () => ({
        models: {
          generateContent: () => Promise.reject(new Error('Gemini Error')),
        },
      });

      await expect(service.generateText({ prompt: 'olá' })).resolves.toBeNull();
    });

    it('should return null without calling the API when not configured', async () => {
      const emptyConfig = { get: jest.fn(() => undefined) };
      const unconfigured = new GeminiClientService(emptyConfig as never);

      await expect(unconfigured.generateText({ prompt: 'olá' })).resolves.toBeNull();
    });
  });
});
