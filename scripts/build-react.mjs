import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = path.join(root, 'packages/react/dist');
const check = process.argv.includes('--check');
const assets = [
  ['styles.css', ['tokens.css', 'components/base.css']],
  ['font.css', ['fonts.css']],
];

function scopeComponentCss(css) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type === 'atrule' && /keyframes$/i.test(parent.name)) return;
    }
    rule.selector = selectorParser((selectors) => {
      selectors.each((selector) => {
        const scope = selectorParser.attribute({ attribute: 'data-dromii-react' });
        selector.prepend(scope);
        selector.insertAfter(scope, selectorParser.combinator({ value: ' ' }));
      });
    }).processSync(rule.selector);
  });
  return root.toString().replace(/[ \t]+(?=\r?\n)/g, '');
}

function approvedReactCss(css) {
  const deferred = css.indexOf('/* ── 앱 셸 · 헤더 · 메뉴');
  const resume = css.indexOf('/* ── 도구 모음 · 패널 · 지표');
  if (deferred < 0 || resume <= deferred) {
    throw new Error('Core CSS section markers changed; review the React package boundary.');
  }
  return css.slice(0, deferred) + css.slice(resume);
}

function scopeTokenCss(css) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    rule.selector = selectorParser((selectors) => {
      selectors.each((selector) => {
        const scope = selectorParser.attribute({ attribute: 'data-dromii-react' });
        const documentRoot = selector.nodes.find((node) => node.type === 'pseudo' && node.value === ':root');
        if (documentRoot) documentRoot.replaceWith(scope);
        else selector.prepend(scope);
      });
    }).processSync(rule.selector);
  });
  return root.toString().replace(/[ \t]+(?=\r?\n)/g, '');
}

if (!check) await mkdir(out, { recursive: true });
for (const [name, inputs] of assets) {
  const content = `/* Generated from ${inputs.join(' + ')}. Run npm run react:build. */\n` +
    (await Promise.all(inputs.map(async (file) => {
      const source = await readFile(path.join(root, file), 'utf8');
      if (file === 'components/base.css') return scopeComponentCss(approvedReactCss(source));
      if (file === 'tokens.css') return scopeTokenCss(source);
      return source;
    }))).join('\n');
  const destination = path.join(out, name);
  if (check) {
    let current;
    try { current = await readFile(destination, 'utf8'); } catch { /* report below */ }
    if (current !== content) throw new Error(`${name} is stale; run npm run react:build`);
  } else {
    await writeFile(destination, content);
  }
}
console.log(check ? 'React CSS package is in sync.' : 'React CSS package built.');
