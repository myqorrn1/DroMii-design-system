import test from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';
import { AuthLayout, AuthLoginForm, AuthSignupForm, PasswordField } from '../src/index.js';
const h = React.createElement;
const act = React.act;
const deferred = () => { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; };

async function mounted(node, run) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost/' });
  const previous = { window: globalThis.window, document: globalThis.document,
    HTMLElement: globalThis.HTMLElement, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document,
    HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(dom.window.document.getElementById('root'));
  const doc = dom.window.document;
  const query = (selector) => doc.querySelector(selector);
  const change = async (name, value) => act(async () => {
    const control = query(`[name="${name}"]`);
    if (control.type === 'checkbox') control.click();
    else {
      const proto = control.tagName === 'SELECT' ? dom.window.HTMLSelectElement.prototype : dom.window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(control, value);
      control.dispatchEvent(new dom.window.Event(control.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    }
  });
  const click = async (selector) => act(async () => query(selector).click());
  const submit = async () => act(async () => query('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })));
  try {
    await act(async () => root.render(node));
    await run({ dom, doc, query, change, click, submit, render: async (next) => act(async () => root.render(next)) });
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, previous); dom.window.close();
  }
}

const companies = [{ value: 'agency', label: '예시 기관' }];
const verification = { checkEmail: async () => ({ available: true }), sendCode: async () => ({ challenge: 'server-challenge' }),
  verifyCode: async () => ({ proof: 'server-proof' }) };

test('auth package retains approved product differences, unique field labels and scoped CSS', async () => {
  const markup = renderToStaticMarkup(h(React.Fragment, null,
    h(AuthLayout, { product: 'k-aquas', view: 'signup', logo: h('img', { alt: 'K-AQUAS', src: '/logo.svg' }) },
      h(AuthSignupForm, { product: 'k-aquas', companyOptions: companies, onSubmit() {} })),
    h(AuthLayout, { product: 'd-road', view: 'signup', logo: h('img', { alt: 'D-ROAD', src: '/logo.svg' }) },
      h(AuthSignupForm, { product: 'd-road', verification, onSubmit() {} })),
    h(AuthLayout, { product: 'd-find', logo: 'D-FIND' }, h(AuthLoginForm, { product: 'd-find', onSubmit() {} })),
    h(AuthLayout, { product: 'd-find', view: 'signup', logo: 'D-FIND' }, h(AuthSignupForm, { product: 'd-find', onSubmit() {} }))));
  const doc = new JSDOM(markup).window.document;
  const ka = doc.querySelector('[data-dromii-react][data-brand="k-aquas"]');
  const road = doc.querySelector('[data-dromii-react][data-brand="d-road"]');
  const [find, findSignup] = doc.querySelectorAll('[data-dromii-react][data-brand="d-find"]');
  assert.equal(ka.querySelector('[name="company"]').tagName, 'SELECT');
  assert.ok(ka.querySelector('[name="terms"]'));
  assert.equal(ka.querySelector('.auth-verify'), null);
  assert.equal(ka.querySelector('[name="marketing"]'), null);
  assert.equal(road.querySelector('[name="company"]').tagName, 'INPUT');
  assert.ok(road.querySelector('.auth-verify'));
  assert.equal(road.querySelector('[name="marketing"]').required, false);
  assert.deepEqual([...find.querySelectorAll('input')].map((input) => input.name), ['email', 'password']);
  assert.equal(find.querySelector('.auth-password-toggle, [name="remember"]'), null);
  assert.match(find.textContent, /현장 탐지 작업을 시작하세요/);
  assert.doesNotMatch(find.textContent, /Google/);
  assert.deepEqual([...findSignup.querySelectorAll('input')].map((input) => input.name), ['name', 'email', 'password', 'confirm']);
  assert.equal(findSignup.querySelector('.auth-group, .auth-consents, .auth-password-toggle'), null);
  assert.match(findSignup.textContent, /관리자가 승인하면 로그인할 수 있습니다/);
  assert.match(findSignup.textContent, /12자 이상 입력하세요/);
  const controls = [...doc.querySelectorAll('input,select')];
  assert.equal(new Set(controls.map((input) => input.id)).size, controls.length);
  controls.forEach((input) => assert.ok([...doc.querySelectorAll('label')].some((label) => label.htmlFor === input.id)));
  assert.throws(() => renderToStaticMarkup(h(AuthSignupForm, { product: 'unknown' })), /supported product/);
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\[data-dromii-react\] \.auth-card/);
  assert.doesNotMatch(css, /\[data-dromii-react\] \.(app-shell|wf-)/);
});

test('signup validates and focuses errors, prevents duplicate requests, retains input after server failure', async () => {
  const response = deferred(); const received = [];
  await mounted(h(AuthSignupForm, { product: 'k-aquas', companyOptions: companies,
    onSubmit: (value) => { received.push(value); return response.promise; } }), async ({ doc, query, change, submit, click }) => {
    await submit();
    const summary = query('.form-error-summary');
    assert.equal(doc.activeElement, summary);
    assert.match(summary.textContent, /이용약관/);
    assert.match(summary.textContent, /회사·기관/);
    assert.doesNotMatch(summary.textContent, /인증을 완료/);
    await click('.form-error-summary a');
    assert.equal(doc.activeElement.name, 'email');
    for (const [name, value] of Object.entries({ email: 'preview@example.com', password: 'sample-password',
      confirm: 'sample-password', name: '사용자', company: 'agency', phone: '010-0000-0000' })) await change(name, value);
    await change('terms'); await change('privacy');
    await submit(); await submit();
    assert.equal(received.length, 1);
    assert.equal(query('fieldset').disabled, true);
    assert.equal(received[0].terms, true);
    assert.equal(received[0].verification, undefined);
    assert.equal(received[0].confirm, undefined);
    assert.equal(received[0].marketing, undefined);
    await act(async () => response.resolve({ error: '서버에서 거절했습니다.', fieldErrors: { name: '이름을 확인하세요.' } }));
    assert.equal(query('fieldset').disabled, false);
    assert.equal(query('[name="email"]').value, 'preview@example.com');
    assert.equal(query('[name="name"]').getAttribute('aria-invalid'), 'true');
    assert.equal(doc.activeElement, query('.form-error-summary'));
    assert.ok(doc.getElementById(query('[name="name"]').getAttribute('aria-describedby')));
  });
});

test('email verification ignores stale responses and requires server proof tied to the current email', async () => {
  const firstCheck = deferred(); let checks = 0; const received = [];
  await mounted(h(AuthSignupForm, { product: 'd-road', onSubmit: (value) => { received.push(value); },
    verification: { ...verification, checkEmail: () => ++checks === 1 ? firstCheck.promise : Promise.resolve({ available: true }),
      verifyCode: async ({ code }) => ({ proof: code === '654321' ? 'actual-server-proof' : '', message: code === '654321' ? '인증 완료' : '코드 불일치' }) } }),
  async ({ query, change, click, submit }) => {
    await change('email', 'old@example.com');
    await click('.auth-inline button');
    await change('email', 'new@example.com');
    await act(async () => firstCheck.resolve({ available: true, message: 'STALE RESPONSE' }));
    assert.doesNotMatch(query('form').textContent, /STALE RESPONSE/);
    await click('.auth-verify > button');
    assert.match(query('.form-error-summary').textContent, /중복 확인/);
    await click('.auth-inline button');
    await click('.auth-verify > button');
    assert.ok(query('[name="code"]'));
    await change('code', '000000');
    await click('.auth-verify .auth-inline button');
    assert.match(query('.form-error-summary').textContent, /코드 불일치/);
    await change('code', '654321');
    await click('.auth-verify .auth-inline button');
    assert.equal(query('[name="code"]').readOnly, true);
    for (const [name, value] of Object.entries({ password: 'sample-password', confirm: 'sample-password', name: '사용자',
      company: '예시 기관', phone: '010-0000-0000' })) await change(name, value);
    await change('privacy');
    await submit();
    assert.equal(received.length, 1);
    assert.deepEqual(received[0].verification, { email: 'new@example.com', proof: 'actual-server-proof' });
    assert.equal(received[0].terms, undefined);
    await change('email', 'changed@example.com');
    assert.equal(query('[name="code"]'), null);
    await submit();
    assert.equal(received.length, 1);
    assert.match(query('.form-error-summary').textContent, /이메일 인증을 완료/);
  });
});

test('D-FIND login and basic signup keep product rules, notices and late-response safety', async () => {
  const response = deferred(); const logins = []; const signups = [];
  await mounted(h(AuthLoginForm, { product: 'd-find', defaultEmail: 'new@example.com',
    notice: { title: '가입 신청이 완료되었습니다', message: '관리자 승인 후 로그인할 수 있습니다.' },
    onSubmit: (value) => { logins.push(value); return response.promise; } }),
    async ({ query, render, change, submit }) => {
      assert.match(query('.banner--success').textContent, /가입 신청이 완료되었습니다/);
      assert.equal(query('[name="email"]').value, 'new@example.com');
      await change('password', 'sample-password-1');
      await submit(); await submit();
      assert.equal(logins.length, 1);
      assert.deepEqual(logins[0], { email: 'new@example.com', password: 'sample-password-1', remember: false });
      await act(async () => response.resolve({ error: '로그인할 수 없습니다. 입력 정보와 계정 승인 상태를 확인해주세요.' }));
      assert.match(query('.form-error-summary').textContent, /계정 승인 상태를 확인해주세요/);
      await render(h(AuthSignupForm, { product: 'd-find', onSubmit: (value) => { signups.push(value); } }));
      await submit();
      assert.match(query('.form-error-summary').textContent, /이름 항목을 입력해 주세요/);
      await change('name', ' 홍길동 '); await change('email', 'new@example.com');
      await change('password', 'short'); await change('confirm', 'other');
      await submit();
      assert.match(query('.form-error-summary').textContent, /비밀번호는 12자 이상이어야 합니다/);
      assert.match(query('.form-error-summary').textContent, /비밀번호 확인이 일치하지 않습니다/);
      await change('password', 'sample-password-1'); await change('confirm', 'sample-password-1');
      await submit();
      assert.deepEqual(signups, [{ email: 'new@example.com', password: 'sample-password-1', name: '홍길동' }]);
      assert.match(query('form').textContent, /관리자 승인 후 로그인할 수 있습니다/);
      const pending = deferred();
      await render(h(AuthLoginForm, { product: 'd-road', onSubmit: () => pending.promise }));
      await change('email', 'preview@example.com'); await change('password', 'sample-password');
      await submit();
      await render(h(AuthLoginForm, { product: 'k-aquas', onSubmit() {} }));
      assert.equal(query('[name="email"]').value, '');
      assert.equal(query('[name="password"]').value, '');
      await act(async () => pending.resolve({ message: 'OLD LOGIN SUCCESS' }));
      assert.doesNotMatch(query('form').textContent, /OLD LOGIN SUCCESS/);
    });
});

test('password visibility uses keyboard button semantics and is concealed when disabled', async () => {
  const props = { label: '비밀번호 확인', required: true, autoComplete: 'new-password', error: '일치하지 않습니다.' };
  await mounted(h(PasswordField, props), async ({ query, click, render }) => {
    assert.equal(query('input').type, 'password');
    assert.equal(query('button').getAttribute('aria-controls'), query('input').id);
    await click('button');
    assert.equal(query('input').type, 'text');
    assert.equal(query('button').getAttribute('aria-pressed'), 'true');
    await render(h(PasswordField, { ...props, disabled: true }));
    assert.equal(query('input').type, 'password');
    assert.equal(query('button').disabled, true);
  });
});
