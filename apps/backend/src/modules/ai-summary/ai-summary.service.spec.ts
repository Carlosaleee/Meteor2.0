import { AiSummaryService } from "./ai-summary.service";
import { GeminiRepository } from "./gemini.repository";

describe("AiSummaryService", () => {
  it("returns gemini repository text", async () => {
    const gemini = {
      generateSurfBrief: jest.fn().mockResolvedValue("Mar working, vento ok."),
    } as unknown as GeminiRepository;
    const service = new AiSummaryService(gemini);
    const result = await service.summarize({
      locationName: "Ilha Comprida",
      surfScore: 72,
      windSpeedMs: 3,
      waveHeightM: 1.1,
      swellHeightM: 1,
      wavePeriodS: 9,
    });
    expect(result.summary).toContain("vento");
  });
});
