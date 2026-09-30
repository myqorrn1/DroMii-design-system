import test from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';
import {
  ThemeScope, Button, TextField, CheckboxField, Badge, Chip, Banner, Toast,
  Dialog, TableContainer, DataTable, SortHeader, Pagination, Tabs, Breadcrumb, Disclosure, Dropdown,
} from '../src/index.js';

const h = React.createElement;

test('packaged CSS keeps tokens and component styles inside ThemeScope', async () => {
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\[data-dromii-react\] \{/);
  assert.match(css, /\[data-dromii-react\]\[data-brand="d-find"\]\[data-scheme="dark"\]/);
  assert.match(css, /\[data-dromii-react\] \.btn--primary \{/);
  assert.doesNotMatch(css, /(^|\n):root\s*\{/);
  assert.doesNotMatch(css, /(^|\n)\.btn--primary\s*\{/);
});

test('theme, field errors and status expose the same semantic contract as the HTML specimens', () => {
  const html = renderToStaticMarkup(h(ThemeScope, { brand: 'd-find' },
    h(TextField, { label: '작업 이름', error: '이름을 입력하세요', required: true }),
    h(Button, { variant: 'primary', loading: true }, '저장'),
    h(Badge, { tone: 'warning' }, '검토 필요'),
    h(Banner, { tone: 'danger', title: '목록을 불러오지 못했습니다' }, '다시 시도하세요')));
  assert.match(html, /data-dromii-react="" data-brand="d-find" data-scheme="dark" data-density="default"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="[^"]+-help"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /role="alert"/);
  assert.match(html, /bdg--warning/);
});

test('table sort and pagination retain native semantics', () => {
  const html = renderToStaticMarkup(h(React.Fragment, null,
    h(TableContainer, { label: '사용자 목록' },
      h(DataTable, null, h('thead', null, h('tr', null,
        h(SortHeader, { direction: 'ascending', onSort() {} }, '이름'))))),
    h(Pagination, { page: 2, pageCount: 10, onPageChange() {} }),
    h(Breadcrumb, { items: [{ label: '관리', href: '/admin' }, { label: '사용자' }] }),
    h(Disclosure, { title: '도움말' }, '필터를 선택하세요')));
  assert.match(html, /role="region"[^>]*tabindex="0"[^>]*aria-label="사용자 목록"/);
  assert.match(html, /aria-sort="ascending"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /aria-label="10페이지"/);
  assert.match(html, /aria-current="page">사용자/);
  assert.match(html, /<details class="dm-disclosure"><summary>도움말/);
});

test('tabs, chip, checkbox and dialog respond to keyboard and controlled state', async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost/' });
  const previous = { window: globalThis.window, document: globalThis.document,
    HTMLElement: globalThis.HTMLElement };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true });
  dom.window.HTMLDialogElement.prototype.showModal = function showModal() { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function close() { this.open = false; };
  const { createRoot } = await import('react-dom/client');
  const { act } = await import('react');
  const root = createRoot(dom.window.document.getElementById('root'));
  let page = 1;
  function Demo() {
    const [tab, setTab] = React.useState('first');
    const [selected, setSelected] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(true);
    return h(React.Fragment, null,
      h(Tabs, { items: [{ id: 'first', label: '첫째', content: '첫 내용' },
        { id: 'second', label: '둘째', content: '둘째 내용' }],
        selected: tab, onChange: setTab }),
      h(Chip, { selected, onClick: () => setSelected(!selected) }, '선택'),
      h(CheckboxField, { label: '모두 선택', indeterminate: true }),
      h(Dropdown, { label: '보기 설정' }, h('button', { type: 'button' }, '기본 밀도')),
      h(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false),
        title: '삭제 확인', description: '되돌릴 수 없습니다.' }),
      h(Pagination, { page, pageCount: 2, onPageChange: (value) => { page = value; } }),
      h(Toast, { tone: 'danger', title: '실패' }, '값은 유지됩니다.'));
  }
  try {
    await act(async () => { root.render(h(Demo)); });
    const tabs = [...dom.window.document.querySelectorAll('[role="tab"]')];
    await act(async () => {
      tabs[0].dispatchEvent(new dom.window.KeyboardEvent('keydown',
        { key: 'ArrowRight', bubbles: true }));
    });
    assert.equal(dom.window.document.querySelector('[role="tab"][aria-selected="true"]').textContent, '둘째');
    assert.match(dom.window.document.querySelector('[role="tabpanel"]').textContent, /둘째 내용/);
    await act(async () => {
      dom.window.document.querySelector('.chip').dispatchEvent(new dom.window.MouseEvent('click',
        { bubbles: true }));
    });
    assert.equal(dom.window.document.querySelector('.chip').getAttribute('aria-pressed'), 'true');
    assert.equal(dom.window.document.querySelector('.ch').indeterminate, true);
    const menu = dom.window.document.querySelector('.dm-menu');
    menu.open = true;
    await act(async () => {
      menu.dispatchEvent(new dom.window.KeyboardEvent('keydown',
        { key: 'Escape', bubbles: true, cancelable: true }));
    });
    assert.equal(menu.open, false);
    assert.equal(dom.window.document.activeElement, menu.querySelector('summary'));
    assert.equal(dom.window.document.querySelector('dialog').open, true);
    await act(async () => {
      dom.window.document.querySelector('dialog').dispatchEvent(new dom.window.Event('cancel',
        { bubbles: true, cancelable: true }));
    });
    assert.equal(dom.window.document.querySelector('dialog').open, false);
    assert.equal(dom.window.document.querySelector('.toast').getAttribute('role'), 'alert');
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, previous);
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    dom.window.close();
  }
});
