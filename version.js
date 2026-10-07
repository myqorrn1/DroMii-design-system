/* Generated from package.json by npm run version:build. Do not edit. */
(() => {
  const version = 'v0.22.0';
  const targets = document.querySelectorAll('[data-ds-version]');
  if (targets.length) {
    targets.forEach((target) => { target.textContent = version; });
    return;
  }
  const badge = document.createElement('small');
  badge.setAttribute('data-ds-version', '');
  badge.setAttribute('aria-label', '드로미 디자인시스템 버전 ' + version);
  badge.textContent = version;
  badge.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:2147483647;padding:2px 5px;border-radius:3px;background:var(--dm-surface-raised,#fff);color:var(--dm-text-secondary,#555);font:11px/1.4 sans-serif;pointer-events:none;opacity:.82';
  document.body.appendChild(badge);
})();
