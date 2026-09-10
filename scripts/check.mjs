import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const failures = [];

const tokenSource = JSON.parse(await readFile(path.join(root, 'tokens/source.json'), 'utf8'));
const sourceTokens = new Map();
const cssNamesByScope = new Map();
function collect(group, prefix, scope) {
  for (const [name, value] of Object.entries(group)) {
    if (name.startsWith('$')) continue;
    const tokenPath = `${prefix}.${name}`;
    if (value?.$value !== undefined) {
      sourceTokens.set(tokenPath, value);
      const cssName = value.$extensions?.['org.dromii.cssName'];
      const names = cssNamesByScope.get(scope) ?? new Set();
      if (names.has(cssName)) failures.push(`${scope}: 중복 CSS 이름 ${cssName}`);
      names.add(cssName);
      cssNamesByScope.set(scope, names);
    }
  }
}
collect(tokenSource.reference, 'reference', 'reference');
for (const [themeName, theme] of Object.entries(tokenSource.themes)) collect(theme, `themes.${themeName}`, themeName);

const visiting = new Set();
const visited = new Set();
function visit(tokenPath) {
  if (visiting.has(tokenPath)) {
    failures.push(`순환 별칭 ${[...visiting, tokenPath].join(' → ')}`);
    return;
  }
  if (visited.has(tokenPath)) return;
  visiting.add(tokenPath);
  const value = sourceTokens.get(tokenPath)?.$value;
  const alias = typeof value === 'string' ? value.match(/^\{([^}]+)\}$/)?.[1] : undefined;
  if (alias && !sourceTokens.has(alias)) failures.push(`${tokenPath}: 정의되지 않은 별칭 ${alias}`);
  if (alias && sourceTokens.has(alias)) visit(alias);
  visiting.delete(tokenPath);
  visited.add(tokenPath);
}
for (const tokenPath of sourceTokens.keys()) visit(tokenPath);

const buildCheck = spawnSync(process.execPath, ['scripts/build-tokens.mjs', '--check'], { cwd: root, encoding: 'utf8' });
if (buildCheck.status !== 0) failures.push(buildCheck.stderr.trim() || buildCheck.stdout.trim());

const tokenCss = (await readFile(path.join(root, 'tokens.css'), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
const definitions = [...tokenCss.matchAll(/(--dm-[\w-]+)\s*:/g)].map((match) => match[1]);
const uniqueDefinitions = new Set(definitions);
if (uniqueDefinitions.size !== 182) failures.push(`고유 토큰 수: 예상 182, 실제 ${uniqueDefinitions.size}`);

const htmlFiles = [
  ...(await readdir(root)).filter((file) => file.endsWith('.html')),
  ...['components', 'foundations'].flatMap(() => [])
];
for (const directory of ['components', 'foundations']) {
  for (const file of (await readdir(path.join(root, directory))).filter((name) => name.endsWith('.html'))) htmlFiles.push(`${directory}/${file}`);
}

for (const file of ['tokens.css', 'components/base.css', ...htmlFiles]) {
  const content = (await readFile(path.join(root, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of content.matchAll(/var\((--dm-[\w-]+)/g)) {
    if (!uniqueDefinitions.has(match[1])) failures.push(`${file}: 미정의 토큰 ${match[1]}`);
  }
}

for (const file of htmlFiles) {
  const content = await readFile(path.join(root, file), 'utf8');
  const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  for (const id of new Set(ids)) if (ids.filter((candidate) => candidate === id).length > 1) failures.push(`${file}: 중복 id ${id}`);
  for (const match of content.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)) if (!ids.includes(match[1])) failures.push(`${file}: 연결 대상 없는 label ${match[1]}`);
  for (const match of content.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    const url = match[1];
    if (/^(?:https?:|data:|mailto:|javascript:)/.test(url)) continue;
    if (!existsSync(path.resolve(root, path.dirname(file), url.split(/[?#]/)[0]))) failures.push(`${file}: 없는 로컬 자산 ${url}`);
  }
}

function luminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/ig).map((part) => parseInt(part, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}
for (const [name, background, foreground] of [
  ['K primary', '5098EC', '16181D'], ['K hover', '2470DB', 'FFFFFF'], ['K pressed', '0F4FBD', 'FFFFFF'],
  ['K placeholder', '5A616D', 'FFFFFF'], ['D placeholder', '9BA3AE', '1E2027'],
  ['D primary', '9D91FF', '16181D'], ['D hover', '8A7CF4', '16181D'], ['D pressed', '7E72E6', '16181D']
]) {
  const ratio = contrast(background, foreground);
  if (ratio < 4.5) failures.push(`${name}: 대비 ${ratio.toFixed(2)}:1`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`검사 통과: 원본 선언 ${sourceTokens.size}개 · 고유 토큰 ${uniqueDefinitions.size}개 · HTML ${htmlFiles.length}개 · 별칭/참조/링크/라벨/주요 대비 오류 0개`);
