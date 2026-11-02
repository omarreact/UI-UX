// Deterministic static build: first-party assets only. No framework or CDN.
const { mkdirSync, rmSync, cpSync, copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const root = resolve(__dirname, '..');
const destination = join(root, 'dist');
rmSync(destination, { recursive: true, force: true });
mkdirSync(join(destination, 'assets', 'images'), { recursive: true });
copyFileSync(join(root, 'index.html'), join(destination, 'index.html'));
const sources = join(root, 'assets', 'images');
if (!existsSync(sources)) throw new Error('Missing repository-owned image directory');
const images = readdirSync(sources).filter(name => name.endsWith('.webp'));
if (images.length !== 13) throw new Error('Expected 13 optimized WebP images; found ' + images.length);
for (const image of images) copyFileSync(join(sources, image), join(destination, 'assets', 'images', image));
const html = readFileSync(join(destination, 'index.html'), 'utf8');
if (/images\.unsplash\.com|cdn\.tailwindcss\.com|fonts\.googleapis\.com/i.test(html))
  throw new Error('External CDN reference found');
for (const url of html.matchAll(/\/(?:assets\/images)\/(photo-[a-z0-9-]+\.webp)/g)) {
  if (!existsSync(join(destination, 'assets', 'images', url[1]))) throw new Error('Missing referenced image ' + url[1]);
}
writeFileSync(join(destination, '_headers'), [
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  X-Frame-Options: DENY',
  '',
  '/assets/images/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  ''
].join('\n'));
console.log('Built static site with ' + images.length + ' self-hosted images.');
