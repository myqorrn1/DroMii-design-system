import * as React from 'react';

const h = React.createElement;
// Keep these paths in sync with the 12 Core SVGs in foundations/icons.html.
const shapes = {
  dashboard: [['path', { d: 'M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z' }]],
  map: [['path', { d: 'M3 6.5 9 3l6 3.5L21 3v14.5L15 21l-6-3.5L3 21V6.5Z' }],
    ['path', { d: 'M9 3v14.5M15 6.5V21' }]],
  upload: [['path', { d: 'M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5' }]],
  user: [['circle', { cx: 9, cy: 8, r: 3 }],
    ['path', { d: 'M3.5 19c.4-3.7 2.2-5.5 5.5-5.5s5.1 1.8 5.5 5.5M16 8h5m-2.5-2.5v5' }]],
  records: [['path', { d: 'M4 5h16v14H4zM8 9h8M8 13h5' }]],
  settings: [['circle', { cx: 12, cy: 12, r: 3 }],
    ['path', { d: 'M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2' }]],
  zoom: [['circle', { cx: 10.5, cy: 10.5, r: 6.5 }],
    ['path', { d: 'm15.5 15.5 5 5M10.5 7v7M7 10.5h7' }]],
  layers: [['path', { d: 'm12 3 9 5-9 5-9-5 9-5Z' }],
    ['path', { d: 'm3 12 9 5 9-5M3 16l9 5 9-5' }]],
  search: [['circle', { cx: 11, cy: 11, r: 7 }], ['path', { d: 'm16 16 5 5' }]],
  bell: [['path', { d: 'M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7ZM10 20h4' }]],
  arrow: [['path', { d: 'M5 12h14M12 5l7 7-7 7' }]],
  close: [['path', { d: 'M5 5l14 14M19 5 5 19' }]],
};

export function Icon({ name, size = 20, label, ...props }) {
  const elements = shapes[name];
  if (!elements) throw new Error(`Unknown Core icon: ${name}`);
  return h('svg', { ...props, viewBox: '0 0 24 24', width: size, height: size,
    fill: 'none', stroke: 'currentColor', strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    role: label ? 'img' : undefined, 'aria-label': label,
    'aria-hidden': label ? undefined : 'true' },
  elements.map(([tag, attrs], index) => h(tag, { ...attrs, key: index })));
}
