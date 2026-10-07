import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const output = `/* Generated from package.json by npm run version:build. Do not edit. */
(() => {
  const version = 'v${pkg.version}';
  const targets = document.querySelectorAll('[data-ds-version]');
  if (targets.length) {
    targets.forEach((target) => { target.textContent = version; });
    return;
  }
  const badge = document.createElement('small');
  badge.setAttribute('data-ds-version', '');
  badge.setAttribute('aria-label', '드로미 디자인시스템 버전 ' + version);
  badge.textContent = version;
  badge.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:2147483647;padding:2px 5px;border-radius:3px;background:var(--dm-surface-raised,#fff);color:var(--dm-text-secondary,#555);font:11px/1.4 sans-serif;pointer-events:none;opacity:.82';
  document.body.appendChild(badge);
})();
`;
const target = path.join(root, 'version.js');
if (process.argv.includes('--check')) {
  const current = await readFile(target, 'utf8').catch(() => '');
  if (current !== output) throw new Error('version.js is out of sync with package.json. Run npm run version:build.');
  console.log(`Version display matches package.json (${pkg.version}).`);
} else {
  await writeFile(target, output);
  console.log(`Generated version.js for ${pkg.version}.`);
}
