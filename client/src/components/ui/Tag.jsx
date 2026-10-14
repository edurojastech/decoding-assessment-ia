import { cx } from './cx.js';

// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/tags (filtro interativo + estado selecionado).
// Com `selected`, vira botão de alternância (aria-pressed).
export function Tag({ selected = false, count, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap',
        'transition-all duration-150',
        selected
          ? 'border-code-blue bg-code-blue text-pulse-lime'
          : 'border-border-default bg-code-blue-50 text-[#2338A8] hover:border-code-blue-200',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={cx('font-semibold', selected ? 'text-canvas' : 'text-[#2338A8]/70')}>{count}</span>
      )}
    </button>
  );
}
