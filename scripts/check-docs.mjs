#!/usr/bin/env node
/**
 * Paridade docs ↔ código (Backlog P2 #2).
 *
 * Compara as rotas declaradas nos controllers Nest (`@Controller` + `@Get/@Post/...`)
 * com as seções `## GET/POST ...` da especificacoes/REFERENCIA_API.md.
 * Determinístico — não conta testes nem linhas, que oscilam com refactors.
 *
 * Uso: pnpm docs:check   (exit 1 se divergirem)
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const SRC = join(root, 'apps', 'backend', 'src');
const DOC = join(root, 'especificacoes', 'REFERENCIA_API.md');

function* walkControllers(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkControllers(p);
    else if (entry.name.endsWith('.controller.ts')) yield p;
  }
}

function normalizePath(...parts) {
  const path = parts.filter(Boolean).join('/');
  return path.startsWith('/') ? path : `/${path}`;
}

function codeRoutes() {
  const routes = new Set();
  for (const file of walkControllers(SRC)) {
    const text = readFileSync(file, 'utf8');
    const prefixMatch = text.match(/@Controller\(\s*(?:['"]([^'"]*)['"])?\s*\)/);
    const prefix = (prefixMatch?.[1] ?? '').replace(/^\/+|\/+$/g, '');

    const methodRe = /@(Get|Post|Put|Patch|Delete|All)\(\s*(?:['"]([^'"]*)['"])?\s*\)/g;
    let m;
    while ((m = methodRe.exec(text)) !== null) {
      const method = m[1].toUpperCase();
      const path = (m[2] ?? '').replace(/^\/+/, '');
      routes.add(`${method} ${normalizePath(prefix, path)}`);
    }
  }
  return routes;
}

function docRoutes() {
  const routes = new Set();
  const text = readFileSync(DOC, 'utf8');
  const re = /^##\s+(GET|POST|PUT|PATCH|DELETE|ALL)\s+(\S+)\s*$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    routes.add(`${m[1]} ${m[2]}`);
  }
  return routes;
}

const code = codeRoutes();
const doc = docRoutes();

const missingInDoc = [...code].filter(r => !doc.has(r)).sort();
const missingInCode = [...doc].filter(r => !code.has(r)).sort();

console.log(`Rotas no código: ${code.size} | seções na REFERENCIA_API.md: ${doc.size}`);

if (missingInDoc.length === 0 && missingInCode.length === 0) {
  console.log('OK: docs e controllers em paridade.');
  process.exit(0);
}

if (missingInDoc.length > 0) {
  console.error('\nRotas presentes no código mas AUSENTES na documentação:');
  for (const r of missingInDoc) console.error(`  - ${r}`);
}
if (missingInCode.length > 0) {
  console.error('\nSeções documentadas mas INEXISTENTES no código:');
  for (const r of missingInCode) console.error(`  - ${r}`);
}
console.error('\nSincronize especificacoes/REFERENCIA_API.md com os controllers.');
process.exit(1);
