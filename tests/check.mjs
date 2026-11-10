// Static checks for the site. Run with `npm test` (Node 18+, no dependencies).
// Checks: page basics, every relative link and asset resolves, no root-absolute links
// (the site lives under /troupe-vault/), only known outside hosts, placeholder links carry
// ?v=vault, the copy stays in shadow mode with no private names or hype words, the site is
// waitlist only (no prices, pre-orders or refunds), and the six jobs hang off the Chief of Staff.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skipDirs = new Set(['.git', 'node_modules', 'tests', '.claude']);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return skipDirs.has(name) ? [] : walk(p);
    return [p];
  });
}

const pages = walk(root).filter((p) => p.endsWith('.html'));
const cast = ['grocer', 'bill-clerk', 'librarian', 'researcher', 'poster', 'planner'];
const allowedHosts = ['fonts.googleapis.com', 'fonts.gstatic.com', 'docs.google.com'];
const banned = [
  // shadow mode: what it does, never how
  'harness', 'subagent', 'sub-agent', 'routing', 'orchestrat', 'worker', 'model', 'llm', 'claude', 'gemini', 'openai',
  // the reference site's brand
  'angus', 'sewell', 'nontechnical', 'member vault',
  // private names and paths
  'firstmate', 'treehouse', 'artsys', '/users/', 'ts.net', 'lavish',
  // hype
  'revolution', 'supercharg', 'seamless', 'unleash', 'game-chang', 'cutting-edge', 'effortless', 'magic', 'powerful', 'ultimate', 'blazing',
  // waitlist only: no prices, tiers, pre-orders or refunds
  'pre-order', 'preorder', 'refund', '[price]', 'gumroad', 'per month', '/month', 'tier',
];

const errors = [];
const fail = (file, msg) => errors.push(`${relative(root, file)}: ${msg}`);
const ids = new Map();
const html = new Map();

for (const file of pages) {
  const src = readFileSync(file, 'utf8');
  html.set(file, src);
  ids.set(file, new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

for (const [file, src] of html) {
  if (!/^<!doctype html>/i.test(src)) fail(file, 'missing <!doctype html>');
  if (!/<html lang="en">/.test(src)) fail(file, 'missing <html lang="en">');
  if (!/<meta name="viewport"/.test(src)) fail(file, 'missing viewport meta');
  if (!/<title>[^<]+<\/title>/.test(src)) fail(file, 'missing <title>');
  const h1s = (src.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(file, `expected one <h1>, found ${h1s}`);
  for (const m of src.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) fail(file, `img without alt: ${m[0]}`);
  }

  for (const m of src.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (url.startsWith('mailto:')) continue;
    if (/^https?:\/\//.test(url)) {
      const u = new URL(url);
      if (!allowedHosts.includes(u.hostname.toLowerCase())) fail(file, `unexpected outside link: ${url}`);
      if (url.includes('PLACEHOLDER') && u.searchParams.get('v') !== 'vault') fail(file, `placeholder link without ?v=vault: ${url}`);
      continue;
    }
    if (url.startsWith('/')) { fail(file, `root-absolute link breaks under /troupe-vault/: ${url}`); continue; }
    const [pathPart, hash] = url.split('#');
    const target = pathPart ? resolve(dirname(file), pathPart.split('?')[0]) : file;
    if (!existsSync(target) || !statSync(target).isFile()) { fail(file, `broken link: ${url}`); continue; }
    if (hash && target.endsWith('.html') && !ids.get(target)?.has(hash)) fail(file, `missing anchor #${hash} in ${relative(root, target)}`);
  }

  const text = src
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<link[^>]*>/g, ' ')
    .replace(/\s(?:href|src)="[^"]*"/g, ' ')
    .toLowerCase();
  for (const word of banned) {
    if (text.includes(word)) fail(file, `banned word in copy: "${word}"`);
  }
  const money = text.match(/[$€£]\s?\d/);
  if (money) fail(file, `price in copy: "${money[0]}"`);
}

const index = html.get(join(root, 'index.html'));
const chief = html.get(join(root, 'cast', 'chief-of-staff.html'));
if (!index) errors.push('index.html is missing');
else {
  if (!index.includes('href="cast/chief-of-staff.html"')) errors.push('index.html: no link to cast/chief-of-staff.html');
  for (const name of cast) {
    if (!index.includes(`href="cast/${name}.html"`)) errors.push(`index.html: no link to cast/${name}.html`);
  }
  if (!/docs\.google\.com\/forms[^"]*\?v=vault/.test(index)) errors.push('index.html: no join link');
}
if (!chief) errors.push('cast/chief-of-staff.html is missing');
for (const name of cast) {
  const page = html.get(join(root, 'cast', `${name}.html`));
  if (!page) { errors.push(`cast/${name}.html is missing`); continue; }
  if (chief && !chief.includes(`href="${name}.html"`)) errors.push(`cast/chief-of-staff.html: no link to ${name}.html`);
  if (!page.includes('href="chief-of-staff.html"')) errors.push(`cast/${name}.html: no link back to chief-of-staff.html`);
}

if (errors.length) {
  console.error(`${errors.length} problem(s):\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`ok: ${pages.length} pages checked`);
