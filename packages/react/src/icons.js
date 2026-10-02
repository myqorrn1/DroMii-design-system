import * as React from 'react';
import { iconNodes, coreIcons } from './icon-nodes.js';

const h = React.createElement;

// Internal rendering also serves select and password controls; public Icon names stay unchanged.
export function LibraryIcon({ name, size = 20, ...props }) {
  const elements = iconNodes[name];
  if (!elements) throw new Error(`Unknown library icon: ${name}`);
  return h('svg', { ...props, 'data-lucide': name, viewBox: '0 0 24 24', width: size, height: size,
    fill: 'none', stroke: 'currentColor', strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
  elements.map(([tag, attrs], index) => h(tag, { ...attrs, key: index })));
}

export function Icon({ name, size = 20, label, ...props }) {
  const libraryName = coreIcons[name];
  const elements = iconNodes[libraryName];
  if (!elements) throw new Error(`Unknown Core icon: ${name}`);
  return h('svg', { ...props, 'data-lucide': libraryName, viewBox: '0 0 24 24', width: size, height: size,
    fill: 'none', stroke: 'currentColor', strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    role: label ? 'img' : undefined, 'aria-label': label,
    'aria-hidden': label ? undefined : 'true' },
  elements.map(([tag, attrs], index) => h(tag, { ...attrs, key: index })));
}
