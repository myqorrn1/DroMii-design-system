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
const sourceCssNames = new Set();
function collect(group, prefix, scope) {
  for (const [name, value] of Object.entries(group)) {
    if (name.startsWith('$')) continue;
    const tokenPath = `${prefix}.${name}`;
    if (value?.$value !== undefined) {
      sourceTokens.set(tokenPath, value);
      const cssName = value.$extensions?.['org.dromii.cssName'];
      sourceCssNames.add(cssName);
      const names = cssNamesByScope.get(scope) ?? new Set();
      if (names.has(cssName)) failures.push(`${scope}: 중복 CSS 이름 ${cssName}`);
      names.add(cssName);
      cssNamesByScope.set(scope, names);
    }
  }
}
collect(tokenSource.reference, 'reference', 'reference');
for (const [brand, group] of Object.entries(tokenSource.semantic.brand)) {
  collect(group, `semantic.brand.${brand}`, `brand.${brand}`);
}
for (const [scheme, group] of Object.entries(tokenSource.semantic.scheme)) {
  collect(group, `semantic.scheme.${scheme}`, `scheme.${scheme}`);
}
collect(tokenSource.component.base, 'component.base', 'component.base');
for (const [density, group] of Object.entries(tokenSource.component.density)) {
  collect(group, `component.density.${density}`, `density.${density}`);
}

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
for (const selector of ['[data-product="k-aquas"]', '[data-product="d-road"]',
  '[data-brand="k-aquas"]', '[data-brand="d-road"]',
  '[data-scheme="light"]', '[data-scheme="dark"]',
  '[data-density="default"]', '[data-density="compact"]']) {
  if (!tokenCss.includes(`${selector} {`)) failures.push(`생성 CSS에 ${selector} 설정 축이 없습니다.`);
}
if (tokenCss.includes('[data-scheme="high-contrast"]')) failures.push('고대비는 아직 예약된 축이며 CSS를 생성하면 안 됩니다.');
const definitions = [...tokenCss.matchAll(/(--dm-[\w-]+)\s*:/g)].map((match) => match[1]);
const uniqueDefinitions = new Set(definitions);
if (uniqueDefinitions.size !== sourceCssNames.size) failures.push(`고유 토큰 수 불일치: JSON ${sourceCssNames.size}, CSS ${uniqueDefinitions.size}`);

const htmlFiles = (await readdir(root)).filter((file) => file.endsWith('.html'));
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

const overview = await readFile(path.join(root, 'overview.html'), 'utf8');
if (!overview.includes(`<span class="n">${sourceCssNames.size}</span><span class="l">고유 토큰</span>`)) {
  failures.push(`overview.html의 고유 토큰 수가 JSON ${sourceCssNames.size}개와 다릅니다.`);
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
const grades = tokenSource.$extensions['org.dromii.contrastGrades'];
const expectedGrades = { 40: 3, 50: 4.5, 70: 7, 90: 15 };
if (JSON.stringify(grades) !== JSON.stringify(expectedGrades)) failures.push('매직 넘버 대비 등급이 40/50/70/90 기준과 다릅니다.');
const checks = tokenSource.$extensions['org.dromii.contrastChecks'];
if (!Array.isArray(checks) || ![40, 50, 70, 90].every((grade) => checks.some((item) => item.grade === grade))) {
  failures.push('매직 넘버 40/50/70/90 검사 조합이 모두 필요합니다.');
} else {
  for (const brand of Object.keys(tokenSource.semantic.brand)) {
    for (const scheme of ['light', 'dark']) {
      const context = new Map();
      for (const group of [tokenSource.reference, tokenSource.component.base,
        tokenSource.semantic.brand[brand], tokenSource.semantic.scheme[scheme],
        tokenSource.component.density.default]) {
        for (const [name, value] of Object.entries(group)) {
          if (!name.startsWith('$') && value?.$value !== undefined) context.set(name, value);
        }
      }
      function resolvedColor(name, seen = new Set()) {
        if (seen.has(name)) throw new Error(`순환 색상 변수 ${[...seen, name].join(' → ')}`);
        const value = context.get(name)?.$value;
        if (!value) throw new Error(`없는 색상 변수 ${name}`);
        if (/^#[0-9a-f]{6}$/i.test(value)) return value.slice(1);
        const alias = value.match(/^\{([^}]+)\}$/)?.[1];
        if (alias) {
          const target = sourceTokens.get(alias)?.$extensions?.['org.dromii.cssName'];
          if (!target) throw new Error(`없는 색상 별칭 ${alias}`);
          return resolvedColor(target.slice(2), new Set([...seen, name]));
        }
        const variable = value.match(/^var\((--dm-[\w-]+)\)$/)?.[1];
        if (variable) return resolvedColor(variable.slice(2), new Set([...seen, name]));
        throw new Error(`해석할 수 없는 색상 ${name}: ${value}`);
      }
      for (const item of checks) {
        try {
          const ratio = contrast(resolvedColor(item.foreground), resolvedColor(item.background));
          if (ratio + 0.001 < grades[item.grade]) {
            failures.push(`${brand}/${scheme} 매직넘버 ${item.grade}: ${item.foreground} / ${item.background} ${ratio.toFixed(2)}:1 < ${grades[item.grade]}:1`);
          }
        } catch (error) {
          failures.push(`${brand}/${scheme} 대비 검사 오류: ${error.message}`);
        }
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`검사 통과: 토큰 경로 ${sourceTokens.size}개 · 고유 토큰 ${uniqueDefinitions.size}개 · HTML ${htmlFiles.length}개 · 별칭/참조/링크/라벨/매직 넘버 대비 오류 0개`);
