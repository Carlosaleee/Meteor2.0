const DEFAULT_MAX_CHARS = 800;
const DEFAULT_OVERLAP_CHARS = 120;

/**
 * Divide texto em chunks de até `maxChars`, preservando parágrafos e com
 * sobreposição (`overlapChars`) entre vizinhos — contexto contínuo não se perde
 * na borda do chunk.
 */
export function chunkText(
  text: string,
  maxChars = DEFAULT_MAX_CHARS,
  overlapChars = DEFAULT_OVERLAP_CHARS,
): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    // Parágrafo maior que o máximo: quebra em pedaços lineares.
    if (paragraph.length > maxChars) {
      if (current) {
        chunks.push(current.trim());
        current = '';
      }
      for (let i = 0; i < paragraph.length; i += maxChars) {
        chunks.push(paragraph.slice(i, i + maxChars));
      }
      continue;
    }

    if (current.length + paragraph.length + 2 <= maxChars) {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    } else {
      chunks.push(current.trim());
      // Overlap: carrega o final do chunk anterior no início do próximo.
      const tail = current.slice(Math.max(0, current.length - overlapChars));
      current = `${tail}\n\n${paragraph}`.trim();
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Fatia markdown em blocos por seção (## / ###), mantendo o título do doc como prefixo. */
export function splitMarkdownSections(markdown: string): Array<{ section: string; text: string }> {
  const lines = markdown.split('\n');
  const sections: Array<{ section: string; text: string }> = [];
  let section = 'Introdução';
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join('\n').trim();
    if (text) sections.push({ section, text });
    buffer = [];
  };

  for (const line of lines) {
    const heading = line.match(/^#{1,3}\s+(.*)/);
    if (heading) {
      flush();
      section = heading[1].trim();
    }
    buffer.push(line);
  }
  flush();
  return sections;
}
