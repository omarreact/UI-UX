// Lightweight deployment gate. Uses only Node.js built-ins.
const { readFileSync, existsSync } = require('node:fs');
const { join, resolve } = require('node:path');
const dist = resolve(__dirname, '..', 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');

const assert = (truth, message) => {
  if (!truth) throw new Error('Site validation failed: ' + message);
};
assert((html.match(/<h1(?:\s|>)/gi) || []).length === 1, 'expected exactly one primary heading');
assert((html.match(/<style(?:\s|>)/gi) || []).length >= 1, 'missing native CSS');
assert((html.match(/<script\b[^>]*\bsrc=/gi) || []).length === 0, 'external JavaScript is not allowed');
assert((html.match(/href=["']#["']/gi) || []).length === 0, 'empty placeholder links are not allowed');
assert(!/cdn\.tailwindcss\.com|fonts\.googleapis\.com|images\.unsplash\.com/i.test(html), 'CDN reference found');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert(new Set(ids).size === ids.length, 'duplicate id attributes');
const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
for (const id of hrefs) assert(ids.includes(id), 'unresolved anchor #' + id);

const images = [...html.matchAll(/(?:src|url)\s*=\s*["']?\/?assets\/images\/(photo-[a-z0-9-]+\.webp)/g)].map(m => m[1]);
for (const image of images) assert(existsSync(join(dist, 'assets/images', image)), 'missing image ' + image);
assert(images.length >= 10, 'missing photography references');
const script = html.match(/<script>([\s\S]*?)<\/script>/i);
assert(!!script, 'missing vanilla JavaScript');
try { new Function(script[1]); } catch (err) { throw new Error('Invalid inline JavaScript: ' + err.message); }
assert(html.includes('Illustrative Project Concepts'), 'concept disclosure removed');
assert(!/Maya Thompson|Priya Shah|Alex Carter|Daniel Reed|★★★★★/.test(html), 'unverified review detected');
console.log('Static quality gate passed: anchors, unique IDs, images, no CDNs, JavaScript, truthful concepts.');
