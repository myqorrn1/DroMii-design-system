import * as React from 'react';
export { Icon } from './icons.js';
import { LibraryIcon } from './icons.js';

const h = React.createElement;
const join = (...values) => values.filter(Boolean).join(' ');
const assignRef = (ref, value) => {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
};

/** Theme variables inherit through the subtree. Keep product-specific content outside Core. */
export function ThemeScope({ brand = 'k-aquas', scheme, density = 'default', as = 'div', children, ...props }) {
  const defaults = { 'k-aquas': 'light', 'd-road': 'dark', 'd-find': 'dark' };
  return h(as, { ...props, 'data-dromii-react': '', 'data-brand': brand,
    'data-scheme': scheme ?? defaults[brand] ?? 'light',
    'data-density': density }, children);
}

export const Button = React.forwardRef(function Button({
  variant = 'secondary', size = 'md', loading = false, disabled, className, children, type = 'button', ...props
}, ref) {
  if (size === 'xs') throw new Error('24px buttons are icon-only; use IconButton size="xs".');
  return h('button', { ...props, ref, type, disabled: disabled || loading,
    'aria-busy': loading || undefined,
    className: join('btn', `btn--${size}`, `btn--${variant}`, loading && 'is-loading', className) },
  loading && h('span', { className: 'dm-spinner', 'aria-hidden': 'true' }),
  children);
});

export const IconButton = React.forwardRef(function IconButton({
  label, size = 'md', className, children, type = 'button', ...props
}, ref) {
  if (!label) throw new Error('IconButton requires a visible-purpose label.');
  if (size !== 'xs' && size !== 'md') throw new Error('IconButton size must be xs or md.');
  return h('button', { ...props, ref, type, 'aria-label': label,
    className: join(size === 'xs' ? 'btn btn--xs btn--secondary' : 'icon-btn', className) }, children);
});

function createField(tag, extras) {
  return React.forwardRef(function Field({
    label, helperText, error, required, id, size = 'md', className, controlClassName, children, ...props
  }, ref) {
    const generated = React.useId();
    const controlId = id ?? generated;
    const helpId = `${controlId}-help`;
    const describedBy = [props['aria-describedby'], (error || helperText) && helpId].filter(Boolean).join(' ') || undefined;
    const input = h(tag, { ...props, ref, id: controlId, required,
      'aria-invalid': error ? true : props['aria-invalid'],
      'aria-describedby': describedBy,
      className: join('ctl', size !== 'md' && `ctl--${size}`, tag === 'textarea' && 'ta', controlClassName) }, children);
    return h('div', { className: join('f', error && 'is-error', className) },
      h('label', { className: 'lb', htmlFor: controlId }, label,
        required && h('span', { className: 'req', 'aria-hidden': 'true' }, ' *')),
      extras ? extras(input) : input,
      (error || helperText) && h('span', { className: 'help', id: helpId }, error || helperText));
  });
}

export const TextField = createField('input');
export const TextareaField = createField('textarea');
export const SelectField = createField('select', (input) =>
  h('span', { className: 'sel' }, input,
    h(LibraryIcon, { name: 'chevron-down', className: 'arw', size: 16 })));

function createChoice(kind) {
  return React.forwardRef(function Choice({
    label, id, className, error, indeterminate = false, ...props
  }, ref) {
    const generated = React.useId();
    const localRef = React.useRef(null);
    React.useEffect(() => {
      if (kind === 'checkbox' && localRef.current) localRef.current.indeterminate = indeterminate;
    }, [indeterminate]);
    const inputId = id ?? generated;
    const controlClass = kind === 'switch' ? 'sw' : join('ch', kind === 'radio' && 'ch--radio');
    return h('label', { className: join('chrow', props.disabled && 'is-disabled', error && 'is-error', className),
      htmlFor: inputId },
    h('input', { ...props, id: inputId, type: kind === 'switch' ? 'checkbox' : kind,
      role: kind === 'switch' ? 'switch' : undefined,
      'aria-invalid': error ? true : props['aria-invalid'],
      className: controlClass,
      ref: (node) => { localRef.current = node; assignRef(ref, node); } }),
    h('span', { className: 'txt' }, label));
  });
}
export const CheckboxField = createChoice('checkbox');
export const RadioField = createChoice('radio');
export const SwitchField = createChoice('switch');

export function Badge({ tone = 'neutral', dot = false, className, children, ...props }) {
  return h('span', { ...props, className: join('bdg', `bdg--${tone}`, dot && 'bdg--dot', className) },
    dot && h('span', { className: join('dot', `dot--${tone}`), 'aria-hidden': 'true' }), children);
}

export const Chip = React.forwardRef(function Chip({
  selected = false, count, className, children, type = 'button', ...props
}, ref) {
  return h('button', { ...props, ref, type, 'aria-pressed': selected,
    className: join('chip', selected && 'is-selected', className) },
  children, count != null && h('span', { className: 'cnt' }, count));
});

export function Banner({ tone = 'info', title, children, action, className, ...props }) {
  return h('div', { ...props, role: props.role ?? (tone === 'danger' ? 'alert' : 'status'),
    className: join('banner', `banner--${tone}`, className) },
  h('span', { className: 'bd' }, h('strong', { className: 'tt' }, title),
    children && h('span', { className: 'ms' }, children)),
  action && h('span', { className: 'act' }, action));
}

export function Toast({ tone = 'info', title, children, onDismiss, duration,
  className, ...props }) {
  const timeout = duration ?? (tone === 'danger' ? 0 : 4000);
  React.useEffect(() => {
    if (!onDismiss || timeout <= 0) return undefined;
    const timer = setTimeout(onDismiss, timeout);
    return () => clearTimeout(timer);
  }, [onDismiss, timeout]);
  return h('div', { ...props, role: props.role ?? (tone === 'danger' ? 'alert' : 'status'),
    className: join('toast', `toast--${tone}`, className) },
  h('span', { className: 'bd' }, h('strong', { className: 'tt' }, title),
    children && h('span', { className: 'ms' }, children)),
  onDismiss && h('button', { type: 'button', className: 'close', 'aria-label': `${title} 알림 닫기`,
    onClick: onDismiss }, '×'));
}

export function ToastRegion({ children, label = '알림', className }) {
  return h('div', { className: join('toast-area', className), role: 'region',
    'aria-label': label, 'aria-live': 'polite' },
    React.Children.toArray(children).slice(-3));
}

/** Parent owns open state. Native dialog supplies top layer, focus containment and Escape. */
export function Dialog({ open, onClose, title, description, children, actions, longForm = false,
  className, ...props }) {
  const ref = React.useRef(null);
  const id = React.useId();
  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    return () => { if (dialog.open) dialog.close(); };
  }, [open]);
  return h('dialog', { ...props, ref,
    'aria-labelledby': `${id}-title`,
    'aria-describedby': description ? `${id}-description` : undefined,
    className: join('dialog', longForm && 'dialog--form', className),
    onCancel: (event) => { event.preventDefault(); onClose?.(); } },
  h('div', { className: 'hd' },
    h('div', { className: 'dialog-heading' },
      h('strong', { className: 'tt', id: `${id}-title` }, title),
      h(IconButton, { label: '창 닫기', className: 'dialog-close', onClick: onClose },
        h(LibraryIcon, { name: 'x' }))),
    description && h('span', { className: 'ms', id: `${id}-description` }, description)),
  children && h('div', { className: 'bd' }, children),
  h('div', { className: 'ft' }, actions ??
    h(Button, { onClick: onClose }, '닫기')));
}

export function TableContainer({ label, density, scroll = false, className, children, ...props }) {
  if (!label) throw new Error('TableContainer requires an accessible label.');
  return h('div', { ...props, role: 'region', tabIndex: 0, 'aria-label': label,
    'data-density': density, className: join('tbl-wrap', scroll && 'tbl-wrap--scroll', className) }, children);
}
export function DataTable({ className, children, ...props }) {
  return h('table', { ...props, className: join('tbl', className) }, children);
}
export function EmptyState({ title, description, action, className }) {
  return h('div', { className: join('panel', 'empty', className) },
    h('strong', { className: 'ttl' }, title),
    h('span', { className: 'txt' }, description),
    action && h('span', { className: 'act' }, action));
}
export function SortHeader({ direction = 'none', onSort, children, className, ...props }) {
  return h('th', { ...props, scope: 'col', 'aria-sort': direction,
    className },
  h('button', { type: 'button', className: 'tbl-sort', onClick: onSort },
    children, h('span', { className: 'tbl-sort__direction', 'aria-hidden': 'true' },
      direction === 'ascending' ? '↑' : direction === 'descending' ? '↓' : '↕')));
}

export function Pagination({ page, pageCount, onPageChange, label = '페이지 이동', className }) {
  if (pageCount <= 1) return null;
  const pages = new Set([1, pageCount, page - 1, page, page + 1]
    .filter((value) => value >= 1 && value <= pageCount));
  const ordered = [...pages].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < ordered.length; i += 1) {
    if (i && ordered[i] - ordered[i - 1] > 1) parts.push(h('span',
      { className: 'page-gap', 'aria-hidden': 'true', key: `gap-${i}` }, '…'));
    const value = ordered[i];
    parts.push(h('button', { type: 'button', className: 'page-btn', key: value,
      'aria-label': `${value}페이지`, 'aria-current': value === page ? 'page' : undefined,
      onClick: () => onPageChange(value) }, value));
  }
  return h('nav', { 'aria-label': label, className: join('pagination', className) },
    h('button', { type: 'button', className: 'page-btn', disabled: page <= 1,
      onClick: () => onPageChange(page - 1) }, '이전'), ...parts,
    h('button', { type: 'button', className: 'page-btn', disabled: page >= pageCount,
      onClick: () => onPageChange(page + 1) }, '다음'));
}

export function Tabs({ items, selected, onChange, label = '탭', className }) {
  const id = React.useId();
  const refs = React.useRef({});
  const active = items.find((item) => item.id === selected && !item.disabled) ??
    items.find((item) => !item.disabled);
  const move = (event, index) => {
    const enabled = items.filter((item) => !item.disabled);
    const current = enabled.findIndex((item) => item.id === items[index].id);
    let target;
    if (event.key === 'ArrowRight') target = enabled[(current + 1) % enabled.length];
    else if (event.key === 'ArrowLeft') target = enabled[(current - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') target = enabled[0];
    else if (event.key === 'End') target = enabled.at(-1);
    if (!target) return;
    event.preventDefault();
    onChange(target.id);
    refs.current[target.id]?.focus();
  };
  return h('div', { className },
    h('div', { className: 'tabs', role: 'tablist', 'aria-label': label },
      items.map((item, index) => h('button', { type: 'button', role: 'tab', key: item.id,
        id: `${id}-tab-${item.id}`, 'aria-controls': `${id}-panel-${item.id}`,
        'aria-selected': item.id === active?.id, tabIndex: item.id === active?.id ? 0 : -1,
        disabled: item.disabled, className: 'tab',
        ref: (node) => { refs.current[item.id] = node; },
        onClick: () => onChange(item.id), onKeyDown: (event) => move(event, index) }, item.label))),
    active && h('div', { role: 'tabpanel', id: `${id}-panel-${active.id}`,
      'aria-labelledby': `${id}-tab-${active.id}`, tabIndex: 0 }, active.content));
}

export function Tooltip({ trigger, children, className }) {
  const id = React.useId();
  if (!React.isValidElement(trigger)) throw new Error('Tooltip trigger must be one React element.');
  const describedBy = [trigger.props['aria-describedby'], id].filter(Boolean).join(' ');
  return h('span', { className: join('tooltip-wrap', className) },
    React.cloneElement(trigger, { 'aria-describedby': describedBy }),
    h('span', { className: 'tooltip', id, role: 'tooltip' }, children));
}

export function Breadcrumb({ items, label = '현재 경로', className }) {
  return h('nav', { 'aria-label': label }, h('ol', { className: join('dm-breadcrumb', className) },
    items.map((item, index) => h('li', { key: item.href ?? index },
      item.href && index < items.length - 1
        ? h('a', { href: item.href }, item.label)
        : h('span', { 'aria-current': index === items.length - 1 ? 'page' : undefined }, item.label)))));
}

export function Disclosure({ title, children, className, ...props }) {
  return h('details', { ...props, className: join('dm-disclosure', className) },
    h('summary', null, title), h('div', { className: 'dm-disclosure__body' }, children));
}

export function Dropdown({ label, children, className, ...props }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const closeOutside = (event) => {
      if (ref.current?.open && !ref.current.contains(event.target)) ref.current.open = false;
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  const close = (focus) => {
    if (!ref.current) return;
    ref.current.open = false;
    if (focus) ref.current.querySelector('summary')?.focus();
  };
  return h('details', { ...props, ref, className: join('dm-menu', className),
    onKeyDown: (event) => {
      props.onKeyDown?.(event);
      if (event.key === 'Escape' && ref.current?.open) { event.preventDefault(); close(true); }
    } },
  h('summary', null, label),
  h('div', { className: 'dm-menu__panel', onClick: (event) => {
    if (event.target.closest('button:not(:disabled), a[href]')) close(true);
  } }, children));
}

export function DropdownItem({ as = 'button', className, children, ...props }) {
  const attributes = { ...props, className: join('dm-menu__item', className) };
  if (as === 'button') attributes.type ??= 'button';
  return h(as, attributes, children);
}

export function FormSection({ title, description, children, headingLevel = 2, className }) {
  const id = React.useId();
  const heading = headingLevel === 3 ? 'h3' : 'h2';
  return h('section', { className: join('form-section', className), 'aria-labelledby': id },
    h(heading, { className: 'form-section-title', id }, title),
    description && h('p', { className: 'form-section-desc' }, description), children);
}
export function FormGrid({ pair = false, children, className }) {
  return h('div', { className: join('form-grid', pair && 'form-grid--pair', className) }, children);
}
export function FormErrorSummary({ title = '입력 내용을 확인하세요.', errors = [], message, className }) {
  return h('div', { className: join('form-error-summary', className), role: 'alert' },
    h('strong', null, title),
    message && h('span', null, message),
    errors.map((error) => h('a', { href: `#${error.id}`, key: error.id }, error.label)));
}
export function FormActions({ status, sticky = false, children, className }) {
  return h('div', { className: join('form-actions', sticky && 'form-actions--sticky', className) },
    status && h('span', { className: 'form-actions__status', 'data-state': status.state,
      role: 'status', 'aria-live': 'polite' }, status.message), children);
}

export function Progress({ label, value, max = 100, className }) {
  const limit = Math.max(1, max);
  return h('div', { className },
    h('span', null, label),
    h('progress', { className: 'dm-progress', value, max: limit, 'aria-label': label }),
    value != null && h('span', null, `${Math.round(Math.min(limit, Math.max(0, value)) / limit * 100)}%`));
}
export function Spinner({ label = '처리 중', className }) {
  return h('span', { className, role: 'status' },
    h('span', { className: 'dm-spinner', 'aria-hidden': 'true' }), ' ', label);
}

export function BarChart({ label, items, maxValue, className }) {
  if (!label) throw new Error('BarChart requires a summary label.');
  const ceiling = Math.max(1, maxValue ?? Math.max(...items.map((item) => item.value), 0));
  return h('ol', { className: join('chart', className), 'aria-label': label,
    style: { gridTemplateColumns: `repeat(${Math.max(1, items.length)}, minmax(0, 1fr))` } },
  items.map((item, index) => h('li', { className: 'chart-item', key: `${item.label}-${index}`,
    style: { '--chart-value': `${Math.max(0, Math.min(100, item.value / ceiling * 100))}%` } },
  h('span', { className: 'chart-track' }, h('span', { className: 'chart-bar', 'aria-hidden': 'true' })),
  h('span', { className: 'value' }, item.valueLabel ?? String(item.value)),
  h('span', { className: 'label' }, item.label))));
}

export { AuthLayout, AuthLoginForm, AuthSignupForm, PasswordField,
  authProductPresets } from './auth.js';
