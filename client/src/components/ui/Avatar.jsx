import { cx } from './cx.js';

// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/avatares
// 4 tamanhos (28/40/56/80px) e 4 tons de marca (Code Blue, Lime, Insight, Root).
const SIZES = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-10 w-10 text-[15px]',
  lg: 'h-14 w-14 text-xl',
  xl: 'h-20 w-20 text-[28px]',
};
const TONES = {
  blue: 'bg-code-blue text-canvas',
  lime: 'bg-pulse-lime text-code-blue',
  insight: 'bg-insight text-code-blue',
  root: 'bg-root text-pulse-lime',
};
const TONE_ORDER = ['insight', 'lime', 'blue', 'root'];

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

// Decorativo: o nome aparece ao lado.
export function Avatar({ name = '', size = 'md', tone, className }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold leading-none shadow-sm',
        SIZES[size],
        TONES[tone ?? toneFor(name)],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
