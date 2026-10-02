// Reimport the approved subset from an installed official npm package; never redraw paths.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
if (!process.argv[2]) throw new Error('Usage: node scripts/import-icons.mjs <lucide-react package directory>');
const directory = path.resolve(process.argv[2]);
const sourcePath = `${root}assets/icons/lucide/source.json`;
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const pkg = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
if (pkg.name !== source.package || pkg.version !== source.version || pkg.license !== source.license) {
  throw new Error('Package name, version and license must match the approved icon source.');
}
for (const [name, icon] of Object.entries(source.icons)) {
  const text = await readFile(path.join(directory, icon.file), 'utf8');
  const array = text.match(/createLucideIcon\("[^"]+",\s*(\[[\s\S]*\])\s*\);/)?.[1];
  if (!array) throw new Error(`Cannot read official icon: ${name}`);
  icon.sha256 = createHash('sha256').update(text).digest('hex');
  icon.nodes = JSON.parse(array.replace(/([{,]\s*)([A-Za-z][A-Za-z0-9]*)(\s*:)/g, '$1"$2"$3')).map(([tag, attrs]) =>
    [tag, Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'key'))]);
}
await writeFile(sourcePath, JSON.stringify(source, null, 2) + '\n');
await writeFile(`${root}assets/icons/lucide/LICENSE`, await readFile(path.join(directory, 'LICENSE'), 'utf8'));
console.log(`Imported ${Object.keys(source.icons).length} official icons. Run npm run icons:build.`);
