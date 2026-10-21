#!/usr/bin/env node
/**
 * Gera apps/backend/data/rag-index-docs.json a partir de especificacoes/*.md.
 *
 * Uso:
 *   node scripts/rag-index.mjs             # com embeddings Gemini (requer GEMINI_API_KEY)
 *   node scripts/rag-index.mjs --no-embed  # só lexical (BM25 no runtime)
 *
 * O arquivo gerado é versionado e embutido no bundle da Vercel (vercel.json
 * includeFiles). Rerode o script sempre que as especificações mudarem.
 *
 * Nota: chunker/tokenizer abaixo são cópias sincronizadas das versões em
 * src/modules/iron/rag/ (o script roda em Node puro, sem toolchain TS).
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..', '..');
const SPEC_DIR = path.join(ROOT, 'especificacoes');
const OUT_DIR = path.join(ROOT, 'apps', 'backend', 'data');
const OUT_FILE = path.join(OUT_DIR, 'rag-index-docs.json');
const EMBED = !process.argv.includes('--no-embed');
const EMBED_BATCH = 20;
const EMBED_CONCURRENCY = 4;

// ---------- env (raiz do monorepo ou apps/backend) ----------
async function loadEnv() {
  for (const p of [path.join(ROOT, '.env'), path.join(ROOT, 'apps', 'backend', '.env')]) {
    try {
      const raw = await readFile(p, 'utf-8');
      for (const line of raw.split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
        if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
      }
    } catch {
      // sem env file — ok
    }
  }
}

// ---------- tokenizer/chunker (manter em sync com src/modules/iron/rag) ----------
const STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'em', 'no',
  'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'sob', 'e', 'ou', 'que', 'se',
  'ao', 'à', 'é', 'ser', 'tem', 'está', 'como', 'qual', 'quais', 'quem', 'quando',
  'onde', 'the', 'of', 'in', 'is', 'are', 'to', 'and',
]);

function tokenize(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

function chunkText(text, maxChars = 1000, overlapChars = 120) {
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let current = '';
  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      if (current) { chunks.push(current.trim()); current = ''; }
      for (let i = 0; i < paragraph.length; i += maxChars) chunks.push(paragraph.slice(i, i + maxChars));
      continue;
    }
    if (current.length + paragraph.length + 2 <= maxChars) {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    } else {
      chunks.push(current.trim());
      const tail = current.slice(Math.max(0, current.length - overlapChars));
      current = `${tail}\n\n${paragraph}`.trim();
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function splitMarkdownSections(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let section = 'Introdução';
  let buffer = [];
  const flush = () => {
    const text = buffer.join('\n').trim();
    if (text) sections.push({ section, text });
    buffer = [];
  };
  for (const line of lines) {
    const heading = line.match(/^#{1,3}\s+(.*)/);
    if (heading) { flush(); section = heading[1].trim(); }
    buffer.push(line);
  }
  flush();
  return sections;
}

// ---------- embeddings via REST (x-goog-api-key) ----------
// API Gemini (out/2026): embedContent/batchEmbedContents usam `content` singular
// (não `contents[]` como o generateContent).
const OUTPUT_DIMS = Number(process.env.GEMINI_EMBEDDING_DIMS || 128);

async function embedBatch(texts, apiKey) {
  const model = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        requests: texts.map(text => ({
          model: `models/${model}`,
          content: { parts: [{ text }] },
          outputDimensionality: OUTPUT_DIMS,
        })),
      }),
    },
  );
  if (!res.ok) throw new Error(`embed API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.embeddings?.map(e => e.values) ?? [];
}

// ---------- main ----------
async function main() {
  await loadEnv();

  const files = (await readdir(SPEC_DIR)).filter(f => f.endsWith('.md'));
  const chunks = [];
  for (const file of files) {
    const markdown = await readFile(path.join(SPEC_DIR, file), 'utf-8');
    for (const { section, text } of splitMarkdownSections(markdown)) {
      chunkText(text).forEach((chunk, j) => {
        chunks.push({
          id: `docs:${file}:${section}:${j}`,
          title: file,
          section,
          text: chunk,
          source: 'docs',
        });
      });
    }
  }
  console.log(`${files.length} docs → ${chunks.length} chunks`);

  // Reusa embeddings da execução anterior (mesmo chunkId + mesma dims) — reruns
  // só embutem o que falta (importante com cota diária do Gemini).
  const embeddings = {};
  let reused = 0;
  let pending = chunks;
  try {
    const previous = JSON.parse(await readFile(OUT_FILE, 'utf-8'));
    for (const [id, vector] of Object.entries(previous.embeddings ?? {})) {
      if (Array.isArray(vector) && vector.length === OUTPUT_DIMS) {
        embeddings[id] = vector;
      }
    }
    reused = chunks.filter(c => embeddings[c.id]).length;
    pending = chunks.filter(c => !embeddings[c.id]);
    if (reused > 0) console.log(`Reusando ${reused} embeddings existentes (${OUTPUT_DIMS} dims)`);
  } catch {
    // sem índice anterior — embute tudo
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (EMBED && apiKey && pending.length > 0) {
    const pendings = [];
    for (let i = 0; i < pending.length; i += EMBED_BATCH) {
      pendings.push([i, pending.slice(i, i + EMBED_BATCH)]);
    }
    let done = 0;
    let failures = 0;
    const workers = Array.from({ length: EMBED_CONCURRENCY }, async () => {
      while (pendings.length > 0) {
        const [start, batch] = pendings.shift();
        try {
          const vectors = await embedBatch(batch.map(c => c.text), apiKey);
          vectors.forEach((v, k) => {
            // Arredondamento: -56.12345678 → -56.12346 (~metade do tamanho do JSON)
            if (v) embeddings[batch[k].id] = v.map(x => Number(x.toFixed(5)));
          });
        } catch (err) {
          failures++;
          console.warn(`  batch @${start} falhou: ${err}`);
        }
        done += batch.length;
        process.stdout.write(`\r  embeddings: ${done}/${pending.length}`);
      }
    });
    await Promise.all(workers);
    process.stdout.write('\n');
    console.log(`Embeddings: ${reused} reusados + ${Object.keys(embeddings).length - reused} novos, ${failures} batches com falha (rerun completa o que faltou)`);
  } else if (EMBED && pending.length === 0) {
    console.log('Todos os chunks já têm embedding — nada a fazer.');
  } else if (EMBED) {
    console.warn('GEMINI_API_KEY ausente — índice será só lexical (BM25). Rerode com a key para embeddings.');
  }

  const index = {
    version: 1,
    builtAt: new Date().toISOString(),
    source: 'docs',
    chunks,
    ...(Object.keys(embeddings).length > 0 ? { embeddings } : {}),
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(index), 'utf-8');
  console.log(`Índice gravado: ${OUT_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
