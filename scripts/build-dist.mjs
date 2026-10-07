import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const check = process.argv.includes('--check');
const version = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
const sources = [
  ['tokens.css', 'dist/dromii-tokens.css'],
  ['components/base.css', 'dist/dromii-core.css'],
  ['components/shell.css', 'dist/dromii-shell.css'],
  ['components/products/k-aquas.css', 'dist/products/k-aquas.css'],
];
// A release merge changes HEAD. Name the last commit that changed a build input,
// so the generated marker remains stable after the dist commit and PR merge.
const sourceCommit = execFileSync('git', [
  'log', '-1', '--format=%h', '--', 'package.json', 'scripts/build-dist.mjs', ...sources.map(([source]) => source),
], { cwd: root, encoding: 'utf8' }).trim();
if (!sourceCommit) throw new Error('Cannot identify the source commit for dist files.');

const failures = [];
for (const [source, destination] of sources) {
  const content = `/* DroMii v${version} · 생성 기준 커밋 ${sourceCommit} · npm run build:dist; 직접 수정하지 마세요. */\n` +
    await readFile(path.join(root, source), 'utf8');
  const output = path.join(root, destination);
  if (check) {
    let current;
    try { current = await readFile(output, 'utf8'); } catch { /* reported below */ }
    if (current !== content) failures.push(destination);
  } else {
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, content);
  }
}
if (failures.length) {
  console.error(`dist 파일이 현재 소스와 다릅니다. npm run build:dist 실행 필요: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(check ? `dist 동기화 확인: v${version} · ${sourceCommit}` : `dist 생성: v${version} · ${sourceCommit}`);
}
