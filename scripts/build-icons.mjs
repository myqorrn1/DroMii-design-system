import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
const source = JSON.parse(await readFile(`${root}assets/icons/lucide/source.json`, 'utf8'));
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const nodes = name => {
  if (!source.icons[name]) throw new Error(`Icon has no official source: ${name}`);
  return source.icons[name].nodes.map(([tag, attrs]) =>
    `<${tag}${Object.entries(attrs).map(([key, value]) => ` ${key}="${escape(value)}"`).join('')}/>`).join('');
};
async function output(file, content) {
  const before = await readFile(`${root}${file}`, 'utf8').catch(() => '');
  if (check && before !== content) throw new Error(`${file}: icons are stale; run npm run icons:build`);
  if (!check && before !== content) await writeFile(`${root}${file}`, content);
}
let count = 0;
for (const directory of ['components', 'foundations']) {
  for (const file of (await readdir(`${root}${directory}`)).filter(file => file.endsWith('.html'))) {
    const path = `${directory}/${file}`;
    const html = await readFile(`${root}${path}`, 'utf8');
    const document = new JSDOM(html);
    for (const icon of document.window.document.querySelectorAll('svg, symbol')) {
      const geometry = [...icon.children].some(child => /^(path|rect|circle|ellipse|line|polyline|polygon)$/.test(child.localName));
      // The map slot is a diagram, not a functional icon. New exceptions require a scope review.
      if (geometry && !icon.hasAttribute('data-lucide') && !icon.classList.contains('ps-map-outline') &&
          !icon.querySelector('g[data-lucide]')) {
        throw new Error(`${path}: functional SVG has no official icon source.`);
      }
    }
    document.window.close();
    const generated = html.replace(/<(svg|symbol|g)\b([^>]*\bdata-lucide="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/g,
      (_, tag, attrs, name) => { count++; return `<${tag}${attrs}>${nodes(name)}</${tag}>`; });
    await output(path, generated);
  }
}
const data = Object.fromEntries(Object.entries(source.icons).map(([name, icon]) => [name, icon.nodes]));
await output('packages/react/src/icon-nodes.js',
  `// Generated from official ${source.package} ${source.version} (ISC). See LICENSE-icons.\n` +
  '// Run npm run icons:build. Do not draw or edit icon geometry here.\n' +
  `export const iconNodes = ${JSON.stringify(data, null, 2)};\n` +
  `export const coreIcons = ${JSON.stringify(source.core, null, 2)};\n`);
const license = await readFile(`${root}assets/icons/lucide/LICENSE`, 'utf8');
await output('packages/react/LICENSE-icons', license);
console.log(`${count} HTML icons and React source ${check ? 'match' : 'generated from'} Lucide ${source.version}.`);
