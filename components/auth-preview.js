/* Local design preview only. No account requests, email delivery or persistent storage. */
(() => {
  const get = (id) => document.getElementById(id);
  const stateSelect = get('auth-preview-state');
  const products = {
    'd-road': { name: 'D-ROAD', scheme: 'dark', logo: 'd-road-horizontal.svg', signup: true, verify: true },
    'k-aquas': { name: 'K-AQUAS', scheme: 'light', logo: 'k-aquas-horizontal.svg', signup: true, verify: false },
    // D-FIND: 이메일·비밀번호 로그인과 관리자 승인형 가입(이름·이메일·비밀번호·확인)만 제공한다.
    'd-find': { name: 'D-FIND', scheme: 'dark', logo: 'd-find.png', signup: true, verify: false, lean: true },
  };
  let brand = 'd-road';
  let product = products[brand];
  let view = 'login';
  let operation = 0;
  let emailChecked = '';
  let codeSentTo = '';
  let verifiedEmail = '';
  let policyTrigger;

  function notice(message) {
    const target = get('auth-preview-feedback');
    target.textContent = message;
    target.hidden = !message;
  }

  function status(id, message, tone) {
    const target = get(id);
    target.textContent = message;
    target.hidden = !message;
    target.dataset.tone = tone || '';
  }

  function fieldError(id, message) {
    const input = get(id);
    const helper = get(`${id}-error`);
    input.closest('.f')?.classList.toggle('is-error', Boolean(message));
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    const describedBy = new Set((input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
    if (message) describedBy.add(helper.id);
    else describedBy.delete(helper.id);
    if (describedBy.size) input.setAttribute('aria-describedby', [...describedBy].join(' '));
    else input.removeAttribute('aria-describedby');
    helper.textContent = message || '';
    helper.hidden = !message;
  }

  function clearErrors(kind = view) {
    get(`auth-${kind}-form`).querySelectorAll('[aria-invalid="true"]').forEach((input) => fieldError(input.id, ''));
    const summary = get(`auth-${kind}-summary`);
    summary.hidden = true;
    summary.replaceChildren();
  }

  function showErrors(errors, message, focus = true) {
    const summary = get(`auth-${view}-summary`);
    const title = document.createElement('strong');
    title.textContent = message || '입력 내용을 확인해 주세요.';
    summary.replaceChildren(title);
    for (const [id, text] of errors) {
      fieldError(id, text);
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = text;
      link.addEventListener('click', (event) => { event.preventDefault(); get(id).focus(); });
      summary.append(link);
    }
    summary.hidden = false;
    if (focus) summary.focus();
  }

  function busy(active) {
    get(`auth-${view}-form`).querySelector('fieldset').disabled = active;
    const button = get(`${view}-submit`);
    button.classList.toggle('is-loading', active);
    button.setAttribute('aria-busy', String(active));
    const pending = view === 'login' ? '로그인 중…' : (product.lean ? '가입 중…' : '가입 요청 중…');
    button.textContent = active ? pending : (view === 'login' ? '로그인' : '회원가입');
  }

  function setBlock(id, show) {
    const block = get(id);
    block.hidden = !show;
    block.querySelectorAll('input, select').forEach((input) => { input.disabled = !show; });
  }

  function syncStateOptions() {
    const option = get('auth-state-registered');
    option.hidden = !(product.lean && view === 'login');
    option.disabled = option.hidden;
  }

  function setView(next, focus = false) {
    operation++;
    busy(false);
    if (get('signup-duplicate').disabled) status('signup-email-status', '');
    get('signup-duplicate').disabled = false;
    view = next === 'signup' && product.signup ? 'signup' : 'login';
    busy(false);
    get('auth-registered').hidden = true;
    syncStateOptions();
    get('auth-login').hidden = view !== 'login';
    get('auth-signup').hidden = view !== 'signup';
    document.querySelectorAll('.auth-preview [data-auth-view]').forEach((button) => {
      button.hidden = button.dataset.authView === 'signup' && !product.signup;
      button.setAttribute('aria-pressed', String(button.dataset.authView === view));
    });
    document.querySelectorAll('[data-password]').forEach((button) => {
      get(button.dataset.password).type = 'password';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `${button.dataset.password === 'signup-confirm' ? '비밀번호 확인' : '비밀번호'} 표시`);
    });
    stateSelect.value = 'default';
    clearErrors();
    notice('');
    const url = new URL(location.href);
    url.searchParams.set('brand', brand);
    url.searchParams.set('view', view);
    url.hash = '';
    history.replaceState(null, '', url);
    if (focus) {
      const heading = get(`auth-${view}-title`);
      heading.tabIndex = -1;
      heading.focus();
    }
  }

  function setProduct(next) {
    operation++;
    busy(false);
    clearErrors('login');
    clearErrors('signup');
    document.querySelectorAll('.auth-form').forEach((form) => {
      form.reset();
      form.querySelector('fieldset').disabled = false;
    });
    if (get('auth-policy-dialog').open) get('auth-policy-dialog').close();
    brand = Object.hasOwn(products, next) ? next : 'd-road';
    product = products[brand];
    document.body.dataset.brand = brand;
    document.body.dataset.scheme = product.scheme;
    get('auth-preview-brand').value = brand;
    document.title = `${product.name} 로그인 · 회원가입 시안 — DroMii Core`;
    document.querySelector('.auth-preview__title strong').textContent = `${product.name} 인증 시안`;
    document.querySelectorAll('.auth-brand').forEach((image) => {
      image.src = `../assets/logos/${product.logo}`;
      image.alt = product.name;
    });
    document.querySelector('.auth-footer').textContent = `DroMii · ${product.name}`;
    const lean = Boolean(product.lean);
    get('auth-login-intro').textContent = lean
      ? '계정으로 로그인해 현장 탐지 작업을 시작하세요.' : '계정으로 로그인해 작업을 이어가세요.';
    get('auth-signup-intro').textContent = lean
      ? '가입 신청 후 관리자가 승인하면 로그인할 수 있습니다.' : `${product.name}에서 사용할 계정을 만들어 주세요.`;
    get('auth-signup-prompt').textContent = lean ? '계정이 없나요?' : '계정이 없으신가요?';
    get('auth-login-prompt').textContent = lean ? '이미 계정이 있나요?' : '이미 계정이 있으신가요?';
    get('auth-signup-entry').hidden = !product.signup;
    // D-FIND에 없는 로그인 상태 유지·비밀번호 표시는 숨기고 입력 오른쪽 여백도 되돌린다.
    get('auth-login-options').hidden = lean;
    document.querySelectorAll('[data-password]').forEach((button) => {
      button.hidden = lean;
      button.parentElement.classList.toggle('auth-password', !lean);
    });
    setBlock('auth-profile-group', true);
    setBlock('auth-consent-group', true);
    get('auth-password-reset').hidden = brand !== 'd-road';
    get('signup-duplicate').hidden = !product.verify;
    get('signup-duplicate').disabled = false;
    get('auth-email-verification').hidden = !product.verify;
    const companySelect = brand === 'k-aquas';
    get('auth-company-input').hidden = companySelect;
    get('signup-company').disabled = companySelect;
    get('auth-company-select').hidden = !companySelect;
    get('signup-company-select').disabled = !companySelect;
    get('auth-terms-consent').hidden = !companySelect;
    get('signup-terms').disabled = !companySelect;
    get('auth-marketing-consent').hidden = brand !== 'd-road';
    get('signup-marketing').disabled = brand !== 'd-road';
    get('auth-required-note').textContent = brand === 'd-road'
      ? '필수 항목을 입력해 주세요. 마케팅 수신 동의는 선택입니다.'
      : '필수 항목을 입력하고 이용약관과 개인정보 수집 및 이용에 동의해 주세요.';
    // D-FIND 가입은 이름·이메일·비밀번호·비밀번호 확인 한 묶음이다.
    get('auth-required-note').hidden = lean;
    get('signup-account-title').hidden = lean;
    setBlock('auth-name-first', lean);
    if (lean) {
      setBlock('auth-profile-group', false);
      setBlock('auth-consent-group', false);
    }
    get('signup-password-help').hidden = !lean;
    if (lean) get('signup-password').setAttribute('aria-describedby', 'signup-password-help');
    else get('signup-password').removeAttribute('aria-describedby');
    resetVerification();
    setView(view);
  }

  get('auth-preview-brand').addEventListener('change', (event) => setProduct(event.target.value));

  function emailValue() { return get('signup-email').value.trim(); }
  function validEmail() {
    if (!emailValue() || !get('signup-email').validity.valid) {
      fieldError('signup-email', '올바른 이메일 주소를 입력해 주세요.');
      get('signup-email').focus();
      return false;
    }
    fieldError('signup-email', '');
    return true;
  }

  function resetVerification() {
    emailChecked = '';
    codeSentTo = '';
    verifiedEmail = '';
    get('signup-code').value = '';
    get('signup-code').readOnly = false;
    get('signup-code-field').hidden = true;
    get('signup-send').textContent = '이메일 인증 코드 받기';
    get('signup-verify').disabled = false;
    get('signup-verify').textContent = '인증 확인';
    get('signup-duplicate').textContent = '중복 확인';
    status('signup-email-status', '');
    status('signup-verify-status', '이메일을 입력한 뒤 인증 코드를 받아 주세요.');
    fieldError('signup-code', '');
  }

  async function delay(action) {
    const currentOperation = ++operation;
    await new Promise((resolve) => setTimeout(resolve, 650));
    if (currentOperation === operation) action();
  }

  document.querySelectorAll('[data-auth-view]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.authView, true));
  });
  document.querySelectorAll('[data-password]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = get(button.dataset.password);
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(visible));
      button.setAttribute('aria-label', `${input.id === 'signup-confirm' ? '비밀번호 확인' : '비밀번호'} ${visible ? '숨기기' : '표시'}`);
    });
  });
  document.querySelectorAll('[data-preview-notice]').forEach((button) => {
    button.addEventListener('click', () => notice(button.dataset.previewNotice));
  });
  document.querySelectorAll('.auth-form input, .auth-form select').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.hasAttribute('aria-invalid')) fieldError(input.id, '');
      const summary = input.form.querySelector('.form-error-summary');
      summary.hidden = true;
      summary.replaceChildren();
    });
  });
  get('signup-email').addEventListener('input', () => {
    operation++;
    get('signup-duplicate').disabled = false;
    resetVerification();
    notice('');
  });

  get('signup-duplicate').addEventListener('click', () => {
    if (!validEmail()) return;
    const email = emailValue();
    get('signup-duplicate').disabled = true;
    status('signup-email-status', '이메일을 확인하고 있습니다.');
    delay(() => {
      emailChecked = email;
      get('signup-duplicate').disabled = false;
      status('signup-email-status', '사용 가능한 이메일입니다.', 'success');
      notice('이메일 중복 확인의 가상 성공 응답입니다. 운영 서버에 요청하지 않았습니다.');
    });
  });
  get('signup-send').addEventListener('click', () => {
    if (!validEmail()) return;
    if (emailChecked !== emailValue()) {
      fieldError('signup-email', '이메일 중복 확인을 먼저 진행해 주세요.');
      get('signup-duplicate').focus();
      return;
    }
    codeSentTo = emailValue();
    verifiedEmail = '';
    get('signup-code').value = '';
    get('signup-code').readOnly = false;
    get('signup-code-field').hidden = false;
    get('signup-verify').disabled = false;
    get('signup-verify').textContent = '인증 확인';
    get('signup-send').textContent = '인증 코드 다시 받기';
    fieldError('signup-code', '');
    status('signup-verify-status', '이메일로 받은 인증 코드를 입력해 주세요.');
    notice('실제 이메일은 발송하지 않습니다. 시연용 인증 코드는 123456입니다.');
    get('signup-code').focus();
  });
  get('signup-verify').addEventListener('click', () => {
    if (get('signup-code').value.trim() !== '123456') {
      fieldError('signup-code', '인증 코드가 일치하지 않습니다. 다시 입력해 주세요.');
      status('signup-verify-status', '이메일 인증이 완료되지 않았습니다.', 'error');
      get('signup-code').focus();
      return;
    }
    if (codeSentTo !== emailValue()) return;
    verifiedEmail = codeSentTo;
    fieldError('signup-code', '');
    status('signup-verify-status', '이메일 인증이 완료되었습니다.', 'success');
    get('signup-code').readOnly = true;
    get('signup-verify').textContent = '인증 완료';
    get('signup-verify').disabled = true;
    get('signup-password').focus();
  });

  function validate(form) {
    const errors = [];
    const names = { 'login-email': '이메일', 'login-password': '비밀번호', 'signup-email': '이메일', 'signup-display-name': '이름',
      'signup-password': '비밀번호', 'signup-confirm': '비밀번호 확인', 'signup-name': '이름',
      'signup-company': '회사·기관', 'signup-company-select': '회사·기관', 'signup-phone': '전화번호' };
    form.querySelectorAll('input[required], select[required]').forEach((input) => {
      if (input.matches(':disabled')) return;
      if (input.type === 'checkbox') {
        if (!input.checked) errors.push([input.id, input.id === 'signup-terms' ? '이용약관에 동의해 주세요.' : '개인정보 수집 및 이용에 동의해 주세요.']);
      } else if (!input.value.trim()) errors.push([input.id, `${names[input.id]} 항목을 입력해 주세요.`]);
      else if (input.type === 'email' && !input.validity.valid) errors.push([input.id, '올바른 이메일 주소를 입력해 주세요.']);
    });
    if (view === 'signup') {
      if (product.lean && get('signup-password').value && get('signup-password').value.length < 12) {
        errors.push(['signup-password', '비밀번호는 12자 이상이어야 합니다.']);
      }
      if (get('signup-confirm').value && get('signup-confirm').value !== get('signup-password').value) {
        errors.push(['signup-confirm', product.lean ? '비밀번호 확인이 일치하지 않습니다.' : '입력한 비밀번호가 일치하지 않습니다.']);
      }
      if (product.verify && emailValue() && get('signup-email').validity.valid && verifiedEmail !== emailValue()) {
        errors.push(['signup-email', '이메일 인증을 완료해 주세요.']);
      }
    }
    return errors;
  }

  document.querySelectorAll('.auth-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors();
      const errors = validate(form);
      if (errors.length) { showErrors(errors); return; }
      busy(true);
      delay(() => {
        busy(false);
        if (product.lean && view === 'signup') {
          // D-FIND처럼 가입 신청 뒤 로그인으로 돌아가 승인 안내와 이메일을 이어 보여 준다.
          const email = emailValue();
          setView('login', true);
          get('login-email').value = email;
          get('auth-registered').hidden = false;
          notice('가입 신청 처리 상태 시연을 완료했습니다. 가입 요청과 정보 저장은 수행하지 않았습니다.');
          return;
        }
        notice(`${view === 'login' ? '로그인' : '회원가입'} 입력·처리 상태 시연을 완료했습니다. 인증·가입 요청과 정보 저장은 수행하지 않았습니다.`);
      });
    });
  });

  stateSelect.addEventListener('change', () => {
    operation++;
    busy(false);
    get('signup-duplicate').disabled = false;
    clearErrors();
    notice('');
    get('auth-registered').hidden = stateSelect.value !== 'registered';
    if (stateSelect.value === 'loading') busy(true);
    else if (stateSelect.value === 'error') {
      if (view === 'login') showErrors([], product.lean ? '로그인할 수 없습니다. 입력 정보와 계정 승인 상태를 확인해주세요.' : '이메일 또는 비밀번호를 다시 확인해 주세요.', false);
      else if (product.lean) showErrors([['signup-email', '이미 등록된 이메일입니다.'],
        ['signup-password', '비밀번호는 12자 이상이어야 합니다.']], undefined, false);
      else {
        resetVerification();
        showErrors([['signup-email', '이미 사용 중인 이메일입니다. 다른 이메일을 입력해 주세요.'],
          ['signup-confirm', '입력한 비밀번호가 일치하지 않습니다.']], undefined, false);
      }
    }
  });

  const dialog = get('auth-policy-dialog');
  document.querySelectorAll('[data-policy]').forEach((button) => {
    button.addEventListener('click', () => {
      policyTrigger = button;
      get('auth-policy-title').textContent = ({ terms: '이용약관', privacy: '개인정보 수집 및 이용', marketing: '마케팅 정보 수신' })[button.dataset.policy];
      dialog.showModal();
    });
  });
  get('auth-policy-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => policyTrigger?.focus());
  const params = new URLSearchParams(location.search);
  view = params.get('view') === 'signup' ? 'signup' : 'login';
  setProduct(params.get('brand'));
})();
