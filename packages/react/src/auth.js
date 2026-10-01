import * as React from 'react';
import { Button, ThemeScope } from './index.js';

const h = React.createElement;
const join = (...values) => values.filter(Boolean).join(' ');
export const authProductPresets = Object.freeze({
  'k-aquas': Object.freeze({ name: 'K-AQUAS', scheme: 'light', provider: 'password', signup: true,
    companyMode: 'select', emailVerification: false, termsConsent: true, marketingConsent: false }),
  'd-road': Object.freeze({ name: 'D-ROAD', scheme: 'dark', provider: 'password', signup: true,
    companyMode: 'input', emailVerification: true, termsConsent: false, marketingConsent: true }),
  'd-find': Object.freeze({ name: 'D-FIND', scheme: 'dark', provider: 'google', signup: false,
    companyMode: null, emailVerification: false, termsConsent: false, marketingConsent: false }),
});

/** Supply product assets and navigation. This layout neither fetches nor stores account data. */
export function AuthLayout({ product, scheme, view = 'login', logo, title, description,
  children, switchAction, footer, className }) {
  const preset = authProductPresets[product];
  if (!preset) throw new Error('AuthLayout requires a supported product.');
  const signup = view === 'signup';
  if (signup && !preset.signup) throw new Error('D-FIND does not have an email signup flow.');
  const id = React.useId();
  return h(ThemeScope, { brand: product, scheme },
    h('div', { className: join('auth-page', className), 'data-brand': product },
      h('main', { className: 'auth-stage auth-stage--standalone' },
        h('section', { className: join('auth-card', signup && 'auth-card--signup'), 'aria-labelledby': id },
          logo,
          h('h1', { className: 'auth-heading', id }, title ?? (signup ? '회원가입' : '로그인')),
          h('p', { className: 'auth-intro' }, description ?? (signup
            ? `${preset.name}에서 사용할 계정을 만들어 주세요.`
            : product === 'd-find' ? '계정으로 로그인해 현장 탐지 작업을 시작하세요.' : '계정으로 로그인해 작업을 이어가세요.')),
          children,
          switchAction && h('div', { className: 'auth-switch' }, switchAction)),
        h('div', { className: 'auth-footer' }, footer ?? `DroMii · ${preset.name}`))));
}

export const PasswordField = React.forwardRef(function PasswordField({ label = '비밀번호', id,
  error, helperText, className, disabled, ...props }, ref) {
  const generated = React.useId();
  const controlId = id ?? generated;
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => { if (disabled) setVisible(false); }, [disabled]);
  const helpId = `${controlId}-help`;
  const describedBy = [props['aria-describedby'], (error || helperText) && helpId].filter(Boolean).join(' ') || undefined;
  return h('div', { className: join('f', error && 'is-error', className) },
    h('label', { className: 'lb', htmlFor: controlId }, label),
    h('div', { className: 'auth-password' },
      h('input', { ...props, ref, id: controlId, disabled, type: visible ? 'text' : 'password',
        className: 'ctl ctl--lg', 'aria-invalid': error ? true : props['aria-invalid'], 'aria-describedby': describedBy }),
      h('button', { type: 'button', className: 'auth-password-toggle', disabled,
        'aria-controls': controlId, 'aria-pressed': visible,
        'aria-label': `${typeof label === 'string' ? label : '비밀번호'} ${visible ? '숨기기' : '표시'}`,
        onClick: () => setVisible(!visible) },
        h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true },
          h('path', { d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z' }),
          h('circle', { cx: 12, cy: 12, r: 3 }),
          h('path', { className: 'auth-eye-slash', d: 'm3 3 18 18' })))),
    (error || helperText) && h('span', { className: 'help', id: helpId }, error || helperText));
});

function Field({ id, label, error, helperText, children, action, ...props }) {
  const helpId = `${id}-help`;
  const control = h(children ? 'select' : 'input', { ...props, id,
    className: 'ctl ctl--lg', 'aria-invalid': error ? true : undefined,
    'aria-describedby': (error || helperText) ? helpId : undefined }, children);
  return h('div', { className: join('f', error && 'is-error') },
    h('label', { className: 'lb', htmlFor: id }, label),
    action ? h('div', { className: 'auth-inline' }, control, action) : control,
    (error || helperText) && h('span', { className: 'help', id: helpId }, error || helperText));
}

/** Tickets invalidate late responses after an email change, product change or unmount. */
function useRequest() {
  const generation = React.useRef(0);
  const active = React.useRef('');
  const [pending, setPending] = React.useState('');
  React.useEffect(() => () => { generation.current++; active.current = ''; }, []);
  function invalidate() {
    generation.current++;
    active.current = '';
    setPending('');
  }
  async function run(name, callback, done, failed) {
    if (active.current || !callback) return;
    active.current = name;
    setPending(name);
    const ticket = ++generation.current;
    try {
      const result = await callback();
      if (ticket === generation.current) done(result);
    } catch {
      if (ticket === generation.current) failed();
    } finally {
      if (ticket === generation.current) { active.current = ''; setPending(''); }
    }
  }
  return { pending, run, invalidate };
}

function useFormModel(initial) {
  const prefix = React.useId();
  const [values, setValues] = React.useState(initial);
  const [errors, setErrors] = React.useState({});
  const [message, setMessage] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [failure, setFailure] = React.useState(0);
  const summary = React.useRef(null);
  React.useEffect(() => { if (failure) summary.current?.focus(); }, [failure]);
  const id = (field) => `${prefix}-${field}`;
  function change(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => { const next = { ...previous }; delete next[field]; return next; });
    setMessage(''); setSuccess('');
  }
  function fail(nextErrors = {}, text = '') {
    const known = Object.fromEntries(Object.entries(nextErrors).filter(([field, value]) =>
      Object.hasOwn(initial, field) && typeof value === 'string' && value));
    setErrors(known); setMessage(text); setSuccess(''); setFailure((n) => n + 1);
  }
  function result(response, fallback) {
    if (response?.error || Object.values(response?.fieldErrors ?? {}).some(Boolean)) {
      fail(response.fieldErrors, response.error || '입력 내용을 확인해 주세요.');
    } else { setErrors({}); setMessage(''); setSuccess(response?.message || fallback); }
  }
  const summaryNode = (message || Object.keys(errors).length > 0) && h('div', {
    ref: summary, tabIndex: -1, className: 'form-error-summary', role: 'alert' },
    h('strong', null, message || '입력 내용을 확인해 주세요.'),
    Object.entries(errors).map(([field, text]) => h('a', { key: field, href: `#${id(field)}`,
      onClick: (event) => { event.preventDefault(); summary.current?.closest('form')?.elements.namedItem(field)?.focus(); } }, text)));
  return { values, errors, id, change, fail, result, summaryNode, success,
    clear: () => { setErrors({}); setMessage(''); setSuccess(''); } };
}
const emailValid = (email) => /^[^\s@]+@[^\s@]+$/.test(email);

export function GoogleLoginButton({ onSignIn, loading = false, disabled, icon, ...props }) {
  return h(Button, { ...props, variant: 'primary', size: 'lg', className: join('auth-submit', props.className),
    disabled: disabled || !onSignIn, loading, onClick: onSignIn },
    h('span', { className: 'auth-provider-mark', 'aria-hidden': true }, icon ?? 'G'),
    h('span', null, loading ? '로그인 중…' : 'Google 계정으로 로그인'));
}

/** Product key remounts the form and clears credentials when its identity changes. */
export function AuthLoginForm(props) { return h(LoginForm, { ...props, key: props.product }); }
function LoginForm({ product, onSubmit, onGoogleSignIn, googleIcon, policyActions,
  remember = true, loading = false, error, forgotPasswordAction }) {
  const preset = authProductPresets[product];
  if (!preset) throw new Error('AuthLoginForm requires a supported product.');
  const model = useFormModel({ email: '', password: '', remember: false });
  const request = useRequest();
  const busy = loading || Boolean(request.pending);
  const google = preset.provider === 'google';
  const complete = (response) => model.result(response, '로그인이 완료되었습니다.');
  const failed = () => model.fail({}, google ? 'Google 로그인에 연결하지 못했습니다. 다시 시도해 주세요.'
    : '로그인하지 못했습니다. 이메일 또는 비밀번호를 확인하거나 다시 시도해 주세요.');
  function submit(event) {
    event.preventDefault();
    if (busy || google || !onSubmit) return;
    model.clear();
    const errors = {};
    if (!emailValid(model.values.email.trim())) errors.email = '올바른 이메일 주소를 입력해 주세요.';
    if (!model.values.password) errors.password = '비밀번호를 입력해 주세요.';
    if (Object.keys(errors).length) { model.fail(errors); return; }
    request.run('login', () => onSubmit({ email: model.values.email.trim(), password: model.values.password,
      remember: remember && model.values.remember }), complete, failed);
  }
  const summary = model.summaryNode || (error && h('div', { className: 'form-error-summary', role: 'alert' }, error));
  return h('form', { className: 'auth-form', noValidate: true, onSubmit: submit, 'aria-label': '로그인' },
    summary,
    google ? h('div', { className: 'auth-provider' },
      h(GoogleLoginButton, { icon: googleIcon, loading: busy, disabled: busy, onSignIn: onGoogleSignIn && (() => {
        if (busy) return; model.clear(); request.run('google', onGoogleSignIn, complete, failed);
      }) }),
      h('p', { className: 'auth-provider-note' }, 'Google 계정으로 작업을 시작하세요.'),
      policyActions && h('div', { className: 'auth-policy-links' }, policyActions))
      : h('fieldset', { className: 'auth-fields', disabled: busy, 'aria-label': '로그인 정보' },
        h(Field, { id: model.id('email'), name: 'email', label: '이메일', type: 'email', autoComplete: 'username',
          placeholder: '이메일 주소를 입력하세요', required: true, value: model.values.email, error: model.errors.email,
          onChange: (event) => model.change('email', event.target.value) }),
        h(PasswordField, { id: model.id('password'), name: 'password', label: '비밀번호', autoComplete: 'current-password',
          placeholder: '비밀번호를 입력하세요', required: true, value: model.values.password, error: model.errors.password,
          disabled: busy, onChange: (event) => model.change('password', event.target.value) }),
        (remember || forgotPasswordAction) && h('div', { className: 'auth-options' },
          remember && h('label', { className: 'chrow', htmlFor: model.id('remember') },
            h('input', { className: 'ch', type: 'checkbox', id: model.id('remember'), name: 'remember',
              checked: model.values.remember, onChange: (event) => model.change('remember', event.target.checked) }),
            h('span', null, '로그인 상태 유지')), forgotPasswordAction),
        h(Button, { type: 'submit', variant: 'primary', size: 'lg', className: 'auth-submit',
          disabled: !onSubmit, loading: busy }, busy ? '로그인 중…' : '로그인')),
    model.success && h('p', { className: 'auth-status', role: 'status', 'data-tone': 'success' }, model.success));
}

export function AuthSignupForm(props) { return h(SignupForm, { ...props, key: props.product }); }
function SignupForm({ product, onSubmit, companyOptions = [], companyHelperText, verification,
  onPolicyOpen, passwordHelperText, loading = false, error }) {
  const preset = authProductPresets[product];
  if (!preset?.signup) throw new Error('AuthSignupForm supports K-AQUAS and D-ROAD only.');
  const model = useFormModel({ email: '', password: '', confirm: '', name: '', company: '', phone: '',
    privacy: false, terms: false, marketing: false, code: '' });
  const request = useRequest();
  const [verified, setVerified] = React.useState({});
  const [emailStatus, setEmailStatus] = React.useState({});
  const [codeStatus, setCodeStatus] = React.useState({});
  React.useEffect(() => {
    const target = verified.proof ? 'password' : verified.challenge ? 'code' : null;
    if (target) document.getElementById(model.id(target))?.focus();
  }, [verified.challenge, verified.proof]);
  const busy = loading || request.pending === 'signup';
  const operationBusy = busy || Boolean(request.pending);
  const email = model.values.email.trim();
  const validEmail = () => {
    if (emailValid(email)) return true;
    model.fail({ email: '올바른 이메일 주소를 입력해 주세요.' }); return false;
  };
  const changeEmail = (value) => {
    request.invalidate(); setVerified({}); setEmailStatus({}); setCodeStatus({});
    model.change('email', value); model.change('code', '');
  };
  function submit(event) {
    event.preventDefault();
    if (operationBusy || !onSubmit) return;
    model.clear();
    const errors = {};
    const names = { password: '비밀번호', confirm: '비밀번호 확인', name: '이름', company: '회사·기관', phone: '전화번호' };
    if (!emailValid(email)) errors.email = '올바른 이메일 주소를 입력해 주세요.';
    for (const [key, label] of Object.entries(names)) {
      if (!model.values[key].trim()) errors[key] = `${label} 항목을 입력해 주세요.`;
    }
    if (preset.companyMode === 'select' && model.values.company && !companyOptions.some((option) =>
      option.value === model.values.company && !option.disabled)) errors.company = '사용 가능한 회사·기관을 선택해 주세요.';
    if (model.values.confirm && model.values.confirm !== model.values.password) errors.confirm = '입력한 비밀번호가 일치하지 않습니다.';
    if (!model.values.privacy) errors.privacy = '개인정보 수집 및 이용에 동의해 주세요.';
    if (preset.termsConsent && !model.values.terms) errors.terms = '이용약관에 동의해 주세요.';
    if (preset.emailVerification && emailValid(email) && (!verified.proof || verified.email !== email)) {
      errors.email = '이메일 인증을 완료해 주세요.';
    }
    if (Object.keys(errors).length) { model.fail(errors); return; }
    const value = { email, password: model.values.password, name: model.values.name.trim(),
      company: model.values.company.trim(), phone: model.values.phone.trim(), privacy: model.values.privacy,
      ...(preset.termsConsent && { terms: model.values.terms }),
      ...(preset.marketingConsent && { marketing: model.values.marketing }),
      ...(preset.emailVerification && { verification: { email, proof: verified.proof } }) };
    request.run('signup', () => onSubmit(value), (response) => model.result(response, '회원가입 요청이 완료되었습니다.'),
      () => model.fail({}, '가입 요청을 완료하지 못했습니다. 입력 내용은 유지됩니다. 다시 시도해 주세요.'));
  }
  const field = (name, label, props = {}) => h(Field, { id: model.id(name), name, label,
    required: true, value: model.values[name], error: model.errors[name],
    onChange: (event) => name === 'email' ? changeEmail(event.target.value) : model.change(name, event.target.value), ...props });
  const status = (value) => value.message && h('p', { className: 'auth-status', role: 'status', 'data-tone': value.tone }, value.message);
  const consent = (name, label, required) => h('div', { className: join('f', model.errors[name] && 'is-error'), key: name },
    h('div', { className: 'auth-consent' },
      h('label', { className: 'chrow', htmlFor: model.id(name) },
        h('input', { className: 'ch', type: 'checkbox', id: model.id(name), name, required,
          checked: model.values[name], 'aria-invalid': model.errors[name] ? true : undefined,
          'aria-describedby': model.errors[name] ? `${model.id(name)}-help` : undefined,
          onChange: (event) => model.change(name, event.target.checked) }),
        h('span', null, label, ' ', required ? h('strong', null, '(필수)') : '(선택)')),
      h('button', { className: 'auth-link', type: 'button', disabled: !onPolicyOpen,
        'aria-label': `${label} 내용 보기`, onClick: () => onPolicyOpen?.(name) }, '내용 보기')),
    model.errors[name] && h('span', { className: 'help', id: `${model.id(name)}-help` }, model.errors[name]));
  const group = (name, title, children) => h('section', { className: 'auth-group', 'aria-labelledby': model.id(name) },
    h('h2', { className: 'auth-group-title', id: model.id(name) }, title),
    h('div', { className: 'auth-group-fields' }, children));
  return h('form', { className: 'auth-form', noValidate: true, onSubmit: submit, 'aria-label': '회원가입' },
    model.summaryNode || (error && h('div', { className: 'form-error-summary', role: 'alert' }, error)),
    h('p', { className: 'auth-required-note' }, preset.marketingConsent
      ? '필수 항목을 입력해 주세요. 마케팅 수신 동의는 선택입니다.'
      : '필수 항목을 입력하고 이용약관과 개인정보 수집 및 이용에 동의해 주세요.'),
    h('fieldset', { className: 'auth-fields', disabled: busy, 'aria-label': '회원가입 정보' },
      group('account-title', '계정 정보', h(React.Fragment, null,
        field('email', '이메일', { type: 'email', autoComplete: 'email', placeholder: '업무용 이메일 주소',
          action: preset.emailVerification && h(Button, { size: 'lg', disabled: operationBusy || !verification,
            onClick: () => {
              if (!validEmail()) return;
              setEmailStatus({ message: '이메일을 확인하고 있습니다.' });
              request.run('check', () => verification.checkEmail(email), (response) => {
                setVerified(response?.available ? { checkedEmail: email } : {});
                model.change('code', ''); setCodeStatus({});
                setEmailStatus({ message: response?.message || (response?.available ? '사용 가능한 이메일입니다.' : '이메일을 사용할 수 없습니다.'),
                  tone: response?.available ? 'success' : 'error' });
              }, () => setEmailStatus({ message: '이메일을 확인하지 못했습니다. 다시 시도해 주세요.', tone: 'error' }));
            } }, request.pending === 'check' ? '확인 중…' : '중복 확인') }),
        status(emailStatus),
        preset.emailVerification && h('div', { className: 'auth-verify', role: 'group', 'aria-label': '이메일 인증' },
          h(Button, { size: 'lg', disabled: operationBusy || !verification,
            onClick: () => {
              if (!validEmail()) return;
              if (verified.checkedEmail !== email) { model.fail({ email: '이메일 중복 확인을 먼저 진행해 주세요.' }); return; }
              setVerified({ checkedEmail: email }); model.change('code', '');
              setCodeStatus({ message: '인증 코드를 요청하고 있습니다.' });
              request.run('send', () => verification.sendCode(email), (response) => {
                if (!response?.challenge) { setCodeStatus({ message: '인증 코드 요청을 완료하지 못했습니다.', tone: 'error' }); return; }
                setVerified({ checkedEmail: email, sentEmail: email, challenge: response.challenge });
                setCodeStatus({ message: response.message || '이메일로 받은 인증 코드를 입력해 주세요.' });
              }, () => setCodeStatus({ message: '인증 코드를 받지 못했습니다. 다시 시도해 주세요.', tone: 'error' }));
            } }, request.pending === 'send' ? '요청 중…' : verified.challenge ? '인증 코드 다시 받기' : '이메일 인증 코드 받기'),
          verified.challenge && field('code', '인증 코드', { required: false, inputMode: 'numeric', autoComplete: 'one-time-code',
            placeholder: '인증 코드 입력', readOnly: Boolean(verified.proof), disabled: operationBusy, action: h(Button, {
              size: 'lg', disabled: operationBusy || Boolean(verified.proof), onClick: () => {
                if (!model.values.code.trim()) { model.fail({ code: '인증 코드를 입력해 주세요.' }); return; }
                request.run('verify', () => verification.verifyCode({ email, code: model.values.code.trim(), challenge: verified.challenge }),
                  (response) => {
                    if (!response?.proof) { model.fail({ code: response?.message || '인증 코드를 확인해 주세요.' }); return; }
                    setVerified({ ...verified, email, proof: response.proof });
                    setCodeStatus({ message: response.message || '이메일 인증이 완료되었습니다.', tone: 'success' });
                    model.change('code', model.values.code);
                  }, () => model.fail({ code: '인증 코드를 확인하지 못했습니다. 다시 시도해 주세요.' }));
              } }, request.pending === 'verify' ? '확인 중…' : verified.proof ? '인증 완료' : '인증 확인') }),
          status(codeStatus),
          !codeStatus.message && h('p', { className: 'auth-status' }, verification
            ? '이메일을 입력한 뒤 인증 코드를 받아 주세요.' : '이메일 인증 연결이 필요합니다.')),
        h(PasswordField, { id: model.id('password'), name: 'password', label: '비밀번호', autoComplete: 'new-password',
          placeholder: '비밀번호 입력', required: true, disabled: busy, helperText: passwordHelperText,
          value: model.values.password, error: model.errors.password,
          onChange: (event) => model.change('password', event.target.value) }),
        h(PasswordField, { id: model.id('confirm'), name: 'confirm', label: '비밀번호 확인', autoComplete: 'new-password',
          placeholder: '비밀번호를 다시 입력하세요', required: true, disabled: busy,
          value: model.values.confirm, error: model.errors.confirm,
          onChange: (event) => model.change('confirm', event.target.value) }))),
      group('profile-title', '사용자 정보', h(React.Fragment, null,
        field('name', '이름', { autoComplete: 'name', placeholder: '이름 입력' }),
        preset.companyMode === 'select' ? field('company', '회사·기관', { autoComplete: 'organization', helperText: companyHelperText,
          children: [h('option', { key: '', value: '' }, '소속 회사 또는 기관을 선택하세요'),
            ...companyOptions.map((option) => h('option', { key: option.value, value: option.value, disabled: option.disabled }, option.label))] })
          : field('company', '회사·기관', { autoComplete: 'organization', placeholder: '소속 회사 또는 기관 입력' }),
        field('phone', '전화번호', { type: 'tel', autoComplete: 'tel', placeholder: '연락 가능한 전화번호 입력' }))),
      group('consent-title', '동의 항목', h('div', { className: 'auth-consents' },
        preset.termsConsent && consent('terms', '이용약관 동의', true),
        consent('privacy', '개인정보 수집 및 이용 동의', true),
        preset.marketingConsent && consent('marketing', '마케팅 정보 수신 동의', false))),
      h(Button, { type: 'submit', variant: 'primary', size: 'lg', className: 'auth-submit',
        disabled: operationBusy || !onSubmit, loading: busy }, busy ? '가입 요청 중…' : '회원가입')),
    model.success && h('p', { className: 'auth-status', role: 'status', 'data-tone': 'success' }, model.success));
}
