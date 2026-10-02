import test from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';
import {
  ThemeScope, Button, TextField, CheckboxField, Badge, Chip, Banner, Toast,
  Dialog, TableContainer, DataTable, SortHeader, Pagination, Tabs, Breadcrumb, Disclosure, Dropdown,
  DropdownItem, EmptyState, Icon, IconButton, ToastRegion, FormSection, FormActions,
  FormErrorSummary, BarChart, Progress,
} from '../src/index.js';

const h = React.createElement;

test('packaged CSS keeps tokens and component styles inside ThemeScope', async () => {
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\[data-dromii-react\] \{/);
  assert.match(css, /\[data-dromii-react\]\[data-brand="d-find"\]\[data-scheme="dark"\]/);
  assert.match(css, /\[data-dromii-react\] \.btn--primary \{/);
  assert.doesNotMatch(css, /(^|\n):root\s*\{/);
  assert.doesNotMatch(css, /(^|\n)\.btn--primary\s*\{/);
  assert.doesNotMatch(css, /\[data-dromii-react\] \.app-shell\b/);
  assert.doesNotMatch(css, /\[data-dromii-react\] \.wf-/);
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
    h(TableContainer, { label: '사용자 목록', density: 'compact', scroll: true },
      h(DataTable, null, h('thead', null, h('tr', null,
        h(SortHeader, { direction: 'ascending', onSort() {} }, '이름'))))),
    h(EmptyState, { title: '결과 없음', description: '조건을 바꿔 보세요',
      action: h(Button, { onClick() {} }, '조건 초기화') }),
    h(Pagination, { page: 2, pageCount: 10, onPageChange() {} }),
    h(Breadcrumb, { items: [{ label: '관리', href: '/admin' }, { label: '사용자' }] }),
    h(Disclosure, { title: '도움말' }, '필터를 선택하세요')));
  assert.match(html, /role="region"[^>]*tabindex="0"[^>]*aria-label="사용자 목록"/);
  assert.match(html, /data-density="compact" class="tbl-wrap tbl-wrap--scroll"/);
  assert.match(html, /class="panel empty"/);
  assert.match(html, /aria-sort="ascending"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /aria-label="10페이지"/);
  assert.match(html, /aria-current="page">사용자/);
  assert.match(html, /<details class="dm-disclosure"><summary>도움말/);
});

test('Core icon paths match the HTML foundation and icon-only button stays 24px', async () => {
  const source = new JSDOM(await readFile(new URL('../../../foundations/icons.html', import.meta.url), 'utf8'));
  const names = ['dashboard', 'map', 'upload', 'user', 'records', 'settings',
    'zoom', 'layers', 'search', 'bell', 'arrow', 'close'];
  const sourceSvgs = [...source.window.document.querySelectorAll('.icon-cell svg')];
  assert.equal(sourceSvgs.length, names.length);
  const geometry = (svg) => [...svg.children].map((element) => ({
    tag: element.tagName.toLowerCase(),
    attrs: Object.fromEntries([...element.attributes].map(attr => [attr.name, attr.value])),
  }));
  names.forEach((name, index) => {
    const rendered = new JSDOM(renderToStaticMarkup(h(Icon, { name })));
    const svg = rendered.window.document.querySelector('svg');
    assert.deepEqual(geometry(svg), geometry(sourceSvgs[index]), name);
    assert.equal(svg.getAttribute('aria-hidden'), 'true');
  });
  const html = renderToStaticMarkup(h(IconButton, { size: 'xs', label: '닫기' },
    h(Icon, { name: 'close', size: 12 })));
  assert.match(html, /class="btn btn--xs btn--secondary"/);
  assert.match(html, /aria-label="닫기"/);
  assert.throws(() => renderToStaticMarkup(h(Button, { size: 'xs' }, '문자')), /icon-only/);
  source.window.close();
});

test('form, feedback and bar chart expose the HTML specimen states', () => {
  const html = renderToStaticMarkup(h(ThemeScope, null,
    h(FormSection, { title: '상세 설정', headingLevel: 3 }, '입력'),
    h(FormErrorSummary, { errors: [{ id: 'invalid-name', label: '프로젝트명 입력으로 이동' }] }),
    h(FormActions, { sticky: true, status: { state: 'dirty', message: '저장되지 않은 변경 사항' } },
      h(Button, { variant: 'primary' }, '저장')),
    h(Badge, { tone: 'success', dot: true }, '완료'),
    h(ToastRegion, null, [1, 2, 3, 4].map((value) => h(Toast,
      { key: value, title: `알림 ${value}` }, '완료'))),
    h(BarChart, { label: 'A 48건, B 72건', items: [
      { label: 'A 구간', value: 48, valueLabel: '48건' },
      { label: 'B 구간', value: 72, valueLabel: '72건' },
    ], maxValue: 100 }),
    h(Progress, { label: '자료 전송', value: 150, max: 100 }),
    h(Pagination, { page: 1, pageCount: 1, onPageChange() {} })));
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelector('.form-section h3').textContent, '상세 설정');
  assert.equal(doc.querySelector('.form-section').getAttribute('aria-labelledby'),
    doc.querySelector('.form-section h3').id);
  assert.equal(doc.querySelector('.form-error-summary a').getAttribute('href'), '#invalid-name');
  assert.equal(doc.querySelector('.form-actions__status').dataset.state, 'dirty');
  assert.ok(doc.querySelector('.form-actions--sticky'));
  assert.ok(doc.querySelector('.bdg--dot .dot--success[aria-hidden="true"]'));
  assert.equal(doc.querySelectorAll('.toast-area .toast').length, 3);
  assert.equal(doc.querySelector('.toast-area .toast .tt').textContent, '알림 2');
  assert.equal(doc.querySelectorAll('.chart-item').length, 2);
  assert.equal(doc.querySelector('.chart-item .value').textContent, '48건');
  assert.equal(doc.querySelector('.chart-item .chart-bar').getAttribute('aria-hidden'), 'true');
  assert.equal(doc.querySelector('.dm-progress').getAttribute('value'), '150');
  assert.match(doc.body.textContent, /100%/);
  assert.equal(doc.querySelector('.pagination'), null);
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
      h(Dropdown, { label: '보기 설정' }, h(DropdownItem, null, '기본 밀도')),
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
