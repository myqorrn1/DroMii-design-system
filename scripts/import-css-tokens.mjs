import { mkdir, readFile, writeFile } from 'node:fs/promises';

const css = await readFile(new URL('../tokens.css', import.meta.url), 'utf8');
const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
const scopes = [];
const blockPattern = /(:root|\[data-product="([^"]+)"\])\s*\{([^}]*)\}/g;

for (const match of withoutComments.matchAll(blockPattern)) {
  const id = match[1] === ':root' ? 'reference' : match[2];
  const declarations = [...match[3].matchAll(/(--dm-[\w-]+)\s*:\s*([^;]+);/g)]
    .map((entry) => ({ cssName: entry[1], cssValue: entry[2].trim() }));
  scopes.push({ id, selector: match[1], declarations });
}

if (!scopes.length) throw new Error('tokens.css에서 토큰 블록을 찾지 못했습니다.');

const byScope = new Map(scopes.map((scope) => [scope.id, new Set(scope.declarations.map((token) => token.cssName))]));

function tokenType(name, value) {
  if (name.includes('shadow')) return 'string';
  if (name.includes('font-sans') || name.includes('font-mono')) return 'fontFamily';
  if (name.includes('duration')) return 'duration';
  if (name.includes('ease')) return 'cubicBezier';
  if (name.includes('weight') || name.includes('leading') || name.startsWith('--dm-z-')) return 'number';
  if (/^(?:#|rgb|hsl)/i.test(value) || /^--dm-(?:neutral|accent|success|warning|danger|info|primary|surface|border|row|tooltip|overlay|focus|status|text-(?:primary|secondary|placeholder|muted|disabled|danger|on-))/.test(name)) return 'color';
  if (/^-?\d+(?:\.\d+)?(?:px|rem|em)$/.test(value) || /(?:space|radius|text-(?:caption|sm|body|md|lg|xl|2xl|3xl)|control-|icon-|gap-|input-px|choice-size|modal-w|switch-|table-|badge-|chip-h)/.test(name)) return 'dimension';
  return 'string';
}

function sourceValue(scopeId, cssValue, type) {
  const alias = cssValue.match(/^var\((--dm-[\w-]+)\)$/);
  if (alias) {
    const target = alias[1];
    const path = scopeId !== 'reference' && byScope.get(scopeId)?.has(target)
      ? `themes.${scopeId}.${target.slice(2)}`
      : `reference.${target.slice(2)}`;
    return `{${path}}`;
  }
  if (type === 'number') return Number(cssValue);
  if (type === 'cubicBezier') {
    const parts = cssValue.match(/cubic-bezier\(([^)]+)\)/)?.[1].split(',').map(Number);
    if (parts?.length === 4 && parts.every(Number.isFinite)) return parts;
  }
  return cssValue;
}

function makeToken(scopeId, declaration) {
  const type = tokenType(declaration.cssName, declaration.cssValue);
  return {
    $type: type,
    $value: sourceValue(scopeId, declaration.cssValue, type),
    $extensions: { 'org.dromii.cssName': declaration.cssName }
  };
}

const referenceScope = scopes.find((scope) => scope.id === 'reference');
const source = {
  $description: 'DroMii 디자인 토큰 원본. 생성 파일인 tokens.css를 직접 수정하지 않습니다.',
  $extensions: { 'org.dromii.version': '0.14.0' },
  reference: Object.fromEntries(referenceScope.declarations.map((token) => [token.cssName.slice(2), makeToken('reference', token)])),
  themes: Object.fromEntries(scopes.filter((scope) => scope.id !== 'reference').map((scope) => [
    scope.id,
    {
      $description: `${scope.id} 호환 프리셋`,
      $extensions: { 'org.dromii.selector': scope.selector },
      ...Object.fromEntries(scope.declarations.map((token) => [token.cssName.slice(2), makeToken(scope.id, token)]))
    }
  ]))
};

await mkdir(new URL('../tokens', import.meta.url), { recursive: true });
await writeFile(new URL('../tokens/source.json', import.meta.url), `${JSON.stringify(source, null, 2)}\n`);
console.log(`tokens/source.json 생성: ${scopes.reduce((sum, scope) => sum + scope.declarations.length, 0)}개 선언`);
