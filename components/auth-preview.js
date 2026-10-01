/* Local design preview only. No account requests, email delivery or persistent storage. */
(() => {
  const get = (id) => document.getElementById(id);
  const stateSelect = get('auth-preview-state');
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
    button.textContent = active ? (view === 'login' ? '로그인 중…' : '가입 요청 중…') : (view === 'login' ? '로그인' : '회원가입');
  }

  function setView(next, focus = false) {
    operation++;
    busy(false);
    if (get('signup-duplicate').disabled) status('signup-email-status', '');
    get('signup-duplicate').disabled = false;
    view = next;
    get('auth-login').hidden = view !== 'login';
    get('auth-signup').hidden = view !== 'signup';
    document.querySelectorAll('.auth-preview [data-auth-view]').forEach((button) => {
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
    url.searchParams.set('view', view);
    url.hash = '';
    history.replaceState(null, '', url);
    if (focus) {
      const heading = get(`auth-${view}-title`);
      heading.tabIndex = -1;
      heading.focus();
    }
  }

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
  document.querySelectorAll('.auth-form input').forEach((input) => {
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
    const names = { 'login-email': '이메일', 'login-password': '비밀번호', 'signup-email': '이메일',
      'signup-password': '비밀번호', 'signup-confirm': '비밀번호 확인', 'signup-name': '이름',
      'signup-company': '회사·기관', 'signup-phone': '전화번호' };
    form.querySelectorAll('input[required]').forEach((input) => {
      if (input.type === 'checkbox') {
        if (!input.checked) errors.push([input.id, '개인정보 수집 및 이용에 동의해 주세요.']);
      } else if (!input.value.trim()) errors.push([input.id, `${names[input.id]} 항목을 입력해 주세요.`]);
      else if (input.type === 'email' && !input.validity.valid) errors.push([input.id, '올바른 이메일 주소를 입력해 주세요.']);
    });
    if (view === 'signup') {
      if (get('signup-confirm').value && get('signup-confirm').value !== get('signup-password').value) {
        errors.push(['signup-confirm', '입력한 비밀번호가 일치하지 않습니다.']);
      }
      if (emailValue() && get('signup-email').validity.valid && verifiedEmail !== emailValue()) {
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
    if (stateSelect.value === 'loading') busy(true);
    else if (stateSelect.value === 'error') {
      if (view === 'login') showErrors([], '이메일 또는 비밀번호를 다시 확인해 주세요.', false);
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
      get('auth-policy-title').textContent = button.dataset.policy === 'privacy' ? '개인정보 수집 및 이용' : '마케팅 정보 수신';
      dialog.showModal();
    });
  });
  get('auth-policy-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => policyTrigger?.focus());
  setView(new URLSearchParams(location.search).get('view') === 'signup' ? 'signup' : 'login');
})();
