import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeScope, TableContainer } from '../src/index.js';

// Check the CSS-variable inheritance boundary, which JSDOM's getComputedStyle does not resolve.
// Browser verification separately checks actual element colors and dimensions.
function tokenReader(css, document) {
  const rules = [];
  postcss.parse(css).walkRules(rule => {
    const declarations = rule.nodes.filter(node => node.type === 'decl' && node.prop.startsWith('--dm-'));
    if (!declarations.length) return;
    selectorParser(selectors => selectors.each(selector => {
      let specificity = 0;
      selector.walk(node => {
        if (['attribute', 'class', 'pseudo'].includes(node.type)) specificity += 10;
        if (node.type === 'id') specificity += 100;
        if (node.type === 'tag') specificity += 1;
      });
      rules.push({ selector: selector.toString(), specificity, declarations });
    })).processSync(rule.selector);
  });
  const cache = new WeakMap();
  function computed(element) {
    if (!element) return new Map();
    if (cache.has(element)) return cache.get(element);
    const inherited = computed(element.parentElement);
    const winners = new Map();
    for (const rule of rules) {
      if (!element.matches(rule.selector)) continue;
      for (const declaration of rule.declarations) {
        if ((winners.get(declaration.prop)?.specificity ?? -1) <= rule.specificity) {
          winners.set(declaration.prop, { specificity: rule.specificity, value: declaration.value });
        }
      }
    }
    const values = new Map(inherited);
    function resolve(name, seen = new Set()) {
      if (seen.has(name)) throw new Error(`Cyclic computed variable: ${name}`);
      if (!winners.has(name)) return inherited.get(name) ?? '';
      return winners.get(name).value.replace(/var\((--dm-[\w-]+)\)/g,
        (_, target) => resolve(target, new Set([...seen, name])));
    }
    for (const name of winners.keys()) values.set(name, resolve(name));
    cache.set(element, values);
    return values;
  }
  return (selector, name) => computed(document.querySelector(selector)).get(name);
}

const htmlCss = await readFile(new URL('../../../tokens.css', import.meta.url), 'utf8');
const reactCss = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');

test('HTML product and brand/scheme boundaries recompute primary states instead of inheriting root blue', () => {
  const dom = new JSDOM('<main data-product="d-find"><section id="road" data-product="d-road"></section>' +
    '<section id="axes" data-brand="d-road" data-scheme="dark"></section>' +
    '<section id="find" data-brand="d-find" data-scheme="dark"></section>' +
    '<section id="aquas" data-product="k-aquas"></section></main>');
  const read = tokenReader(htmlCss, dom.window.document);
  for (const target of ['#road', '#axes']) {
    assert.equal(read(target, '--dm-button-primary-bg'), '#9d91ff');
    assert.equal(read(target, '--dm-button-primary-bg-hover'), '#8a7cf4');
    assert.equal(read(target, '--dm-button-primary-bg-pressed'), '#7e72e6');
    assert.equal(read(target, '--dm-button-primary-text'), '#16181d');
  }
  assert.equal(read('#find', '--dm-button-primary-bg'), '#ececec');
  assert.equal(read('#find', '--dm-button-primary-text'), '#181a1c');
  assert.equal(read('#aquas', '--dm-button-primary-bg'), '#5098ec');
  dom.window.close();
});

test('nested default density restores control and table dimensions after compact', () => {
  const dom = new JSDOM('<main data-density="compact"><section id="normal" data-density="default"></section></main>');
  const read = tokenReader(htmlCss, dom.window.document);
  assert.equal(read('main', '--dm-control-h-md'), '32px');
  assert.equal(read('#normal', '--dm-control-h-md'), '40px');
  assert.equal(read('#normal', '--dm-control-h-lg'), '44px');
  assert.equal(read('#normal', '--dm-table-row-h'), '48px');
  assert.equal(read('#normal', '--dm-table-header-h'), '40px');
  dom.window.close();
});

test('React child TableContainer density applies locally and preserves product button roles', () => {
  const h = React.createElement;
  const markup = renderToStaticMarkup(h(ThemeScope, { brand: 'd-find', id: 'find-scope' },
    h(TableContainer, { label: 'Compact', density: 'compact', id: 'compact' },
      h('table', null, h('tbody', null, h('tr', null, h('td', null, 'row'))))),
    h(ThemeScope, { brand: 'd-road', id: 'road-scope' },
      h(TableContainer, { label: 'Default', density: 'default', id: 'normal' }, 'row'))));
  const dom = new JSDOM(markup + '<section id="outside" data-density="compact"></section>');
  const read = tokenReader(reactCss, dom.window.document);
  assert.equal(read('#compact', '--dm-table-row-h'), '40px');
  assert.equal(read('#compact', '--dm-table-header-h'), '36px');
  assert.equal(read('#compact', '--dm-text-body'), '0.875rem');
  assert.equal(read('#compact', '--dm-button-primary-bg'), '#ececec');
  assert.equal(read('#normal', '--dm-table-row-h'), '48px');
  assert.equal(read('#road-scope', '--dm-button-primary-bg'), '#9d91ff');
  assert.equal(read('#find-scope', '--dm-button-primary-bg'), '#ececec');
  assert.equal(read('#outside', '--dm-table-row-h'), undefined);
  dom.window.close();
});
