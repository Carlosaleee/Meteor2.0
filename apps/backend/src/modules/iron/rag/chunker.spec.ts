import { chunkText, splitMarkdownSections } from './chunker';

describe('chunker', () => {
  describe('chunkText', () => {
    it('should keep small text as a single chunk', () => {
      const chunks = chunkText('Parágrafo curto sobre clima.');
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe('Parágrafo curto sobre clima.');
    });

    it('should split paragraphs above maxChars', () => {
      const paragraphs = Array.from({ length: 10 }, (_, i) => `Parágrafo ${i} ${'x'.repeat(90)}`);
      const chunks = chunkText(paragraphs.join('\n\n'), 300, 50);
      expect(chunks.length).toBeGreaterThan(1);
      for (const c of chunks) expect(c.length).toBeLessThanOrEqual(300 + 100);
    });

    it('should carry overlap from the previous chunk', () => {
      const p1 = 'AAAA '.repeat(30).trim(); // ~150 chars
      const p2 = 'BBBB '.repeat(30).trim();
      const chunks = chunkText(`${p1}\n\n${p2}`, 200, 40);
      expect(chunks).toHaveLength(2);
      expect(chunks[1]).toContain('AAAA'); // tail do chunk anterior
      expect(chunks[1]).toContain('BBBB');
    });

    it('should hard-split oversized paragraphs', () => {
      const huge = 'z'.repeat(2500);
      const chunks = chunkText(huge, 800);
      expect(chunks.length).toBe(4);
      expect(chunks.join('')).toBe(huge);
    });
  });

  describe('splitMarkdownSections', () => {
    it('should split on level 1-3 headings', () => {
      const md = '# Título\n\nIntro.\n\n## Seção A\n\nConteúdo A.\n\n### Sub\n\nSub conteúdo.';
      const sections = splitMarkdownSections(md);
      expect(sections.map(s => s.section)).toEqual(['Título', 'Seção A', 'Sub']);
      expect(sections[1].text).toContain('Conteúdo A.');
    });

    it('should not drop heading-less content', () => {
      const sections = splitMarkdownSections('Só texto sem headings.');
      expect(sections).toHaveLength(1);
      expect(sections[0].section).toBe('Introdução');
    });
  });
});
