import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = new URL('../tokens/source.json', import.meta.url);
const outputUrl = new URL('../tokens.css', import.meta.url);
const source = JSON.parse(await readFile(sourceUrl, 'utf8'));

function entries(group) {
  return Object.entries(group).filter(([name, value]) => !name.startsWith('$') && value?.$value !== undefined);
}

const groups = [
  ['reference', source.reference],
  ...Object.entries(source.semantic.brand).map(([name, group]) => [`semantic.brand.${name}`, group]),
  ...Object.entries(source.semantic.scheme).map(([name, group]) => [`semantic.scheme.${name}`, group]),
  ['component.base', source.component.base],
  ...Object.entries(source.component.density).map(([name, group]) => [`component.density.${name}`, group])
];
const pathToCssName = new Map();
for (const [prefix, group] of groups) {
  for (const [name, token] of entries(group)) {
    pathToCssName.set(`${prefix}.${name}`, token.$extensions['org.dromii.cssName']);
  }
}

function cssValue(token) {
  const value = token.$value;
  if (typeof value === 'string') {
    const alias = value.match(/^\{([^}]+)\}$/);
    if (alias) {
      const cssName = pathToCssName.get(alias[1]);
      if (!cssName) throw new Error(`정의되지 않은 별칭: ${value}`);
      return `var(${cssName})`;
    }
    return value;
  }
  if (token.$type === 'cubicBezier' && Array.isArray(value)) return `cubic-bezier(${value.join(', ')})`;
  return String(value);
}

function renderBlock(selector, ...groupsToRender) {
  const lines = groupsToRender.flatMap((group) => entries(group).map(([, token]) =>
    `  ${token.$extensions['org.dromii.cssName']}: ${cssValue(token)};`));
  return `${selector} {\n${lines.join('\n')}\n}`;
}

const defaults = source.$extensions['org.dromii.defaults'];
const presets = source.$extensions['org.dromii.productPresets'];
const version = source.$extensions['org.dromii.version'];
const blocks = [renderBlock(':root', source.reference, source.component.base,
  source.semantic.brand[defaults.brand], source.semantic.scheme[defaults.scheme],
  source.component.density[defaults.density])];
for (const [product, preset] of Object.entries(presets)) {
  blocks.push(renderBlock(`[data-product="${product}"]`,
    source.semantic.brand[preset.brand], source.semantic.scheme[preset.scheme]));
}
for (const [brand, group] of Object.entries(source.semantic.brand)) {
  blocks.push(renderBlock(`[data-brand="${brand}"]`, group,
    source.semantic.scheme[defaults.scheme]));
}
for (const [scheme, group] of Object.entries(source.semantic.scheme)) {
  if (entries(group).length) blocks.push(renderBlock(`[data-scheme="${scheme}"]`, group));
}
for (const [density, group] of Object.entries(source.component.density)) {
  blocks.push(renderBlock(`[data-density="${density}"]`, group));
}

const output = `/* 이 파일은 tokens/source.json에서 자동 생성됩니다. 직접 수정하지 마세요.\n   DroMii Design Tokens v${version} · npm run tokens:build */\n\n${blocks.join('\n\n')}\n`;

if (process.argv.includes('--check')) {
  const current = await readFile(outputUrl, 'utf8');
  if (current !== output) {
    console.error('tokens.css가 tokens/source.json과 다릅니다. npm run tokens:build를 실행하세요.');
    process.exit(1);
  }
  console.log('tokens.css 동기화 확인');
} else {
  await writeFile(outputUrl, output);
  console.log(`tokens.css 생성: 토큰 경로 ${pathToCssName.size}개`);
}
