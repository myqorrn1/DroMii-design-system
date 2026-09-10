import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = new URL('../tokens/source.json', import.meta.url);
const outputUrl = new URL('../tokens.css', import.meta.url);
const source = JSON.parse(await readFile(sourceUrl, 'utf8'));

function entries(group) {
  return Object.entries(group).filter(([name, value]) => !name.startsWith('$') && value?.$value !== undefined);
}

const pathToCssName = new Map();
for (const [name, token] of entries(source.reference)) pathToCssName.set(`reference.${name}`, token.$extensions['org.dromii.cssName']);
for (const [themeName, theme] of Object.entries(source.themes)) {
  for (const [name, token] of entries(theme)) pathToCssName.set(`themes.${themeName}.${name}`, token.$extensions['org.dromii.cssName']);
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

function renderBlock(selector, group) {
  const lines = entries(group).map(([, token]) => `  ${token.$extensions['org.dromii.cssName']}: ${cssValue(token)};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}

const version = source.$extensions['org.dromii.version'];
const blocks = [renderBlock(':root', source.reference)];
for (const theme of Object.values(source.themes)) blocks.push(renderBlock(theme.$extensions['org.dromii.selector'], theme));

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
  console.log(`tokens.css 생성: ${pathToCssName.size}개 선언`);
}
