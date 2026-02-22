#!/usr/bin/env node
// scripts/buildData.mjs
// Node.js utility: export clean JSON from js/data.js
// Usage: node scripts/buildData.mjs
// Output: data/books-actual.json, data/books-speculative.json

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..');

// ── Read and evaluate data.js in a minimal browser-like context ────────────
const dataJs = readFileSync(join(ROOT, 'js', 'data.js'), 'utf8');

// Create a mock window object to capture the BOYD_DATA export
const mockWindow = {};
const fn = new Function('window', dataJs);
fn(mockWindow);

const data = mockWindow.BOYD_DATA;
if (!data) {
  console.error('ERROR: BOYD_DATA not found in js/data.js');
  process.exit(1);
}

// ── Output directory ───────────────────────────────────────────────────────
const outDir = join(ROOT, 'data');
mkdirSync(outDir, { recursive: true });

// ── Write JSON files ───────────────────────────────────────────────────────
function writeJson(filename, content) {
  const path = join(outDir, filename);
  writeFileSync(path, JSON.stringify(content, null, 2), 'utf8');
  console.log(`✓ Wrote ${path} (${content.length} entries)`);
}

writeJson('books-actual.json',      data.ACTUAL_BOOKS);
writeJson('books-speculative.json', data.SPECULATIVE_BOOKS);

// ── Summary ────────────────────────────────────────────────────────────────
console.log('\n── Summary ─────────────────────────────────────────────────────');
console.log(`Actual books:      ${data.ACTUAL_BOOKS.length}`);
console.log(`Speculative books: ${data.SPECULATIVE_BOOKS.length}`);

const categories = [...new Set(data.ACTUAL_BOOKS.map(b => b.category))].sort();
console.log(`\nCategories (${categories.length}):`);
categories.forEach(cat => {
  const count  = data.ACTUAL_BOOKS.filter(b => b.category === cat).length;
  const branch = data.CATEGORY_BRANCH[cat] || '?';
  console.log(`  [${branch}] ${cat}: ${count}`);
});

const avgRating = (
  data.ACTUAL_BOOKS.reduce((s, b) => s + b.rating, 0) / data.ACTUAL_BOOKS.length
).toFixed(2);
console.log(`\nAvg actual rating: ${avgRating}`);

const years = data.ACTUAL_BOOKS.map(b => b.year).filter(y => y > 0);
const minY  = Math.min(...years);
const maxY  = Math.max(...years);
console.log(`Year range: ${minY}–${maxY}`);
