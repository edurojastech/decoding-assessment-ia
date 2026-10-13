import { cx } from './cx.js';

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' };
const TONES = {
  blue: 'bg-code-blue text-canvas',
  insight: 'bg-insight-100 text-code-blue',
  lime: 'bg-pulse-lime text-code-blue',
  neutral: 'bg-code-blue-50 text-code-blue',
};
const TONE_ORDER = ['insight', 'lime', 'neutral', 'blue'];

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

// Tom estável por nome, para a mesma pessoa manter a cor entre telas.
function toneFor(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TONE_ORDER[hash % TONE_ORDER.length];
}

// DS: avatar com iniciais, 4 tamanhos e 4 tons. Decorativo: o nome aparece ao lado.
export function Avatar({ name = '', size = 'md', tone, className }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZES[size],
        TONES[tone ?? toneFor(name)],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
