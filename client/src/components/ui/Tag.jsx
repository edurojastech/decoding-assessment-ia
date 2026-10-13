import { cx } from './cx.js';

// DS: chip de filtro. Com `selected`, vira botão de alternância (aria-pressed).
export function Tag({ selected = false, count, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm font-semibold whitespace-nowrap',
        'transition-[background-color,border-color] duration-150',
        selected
          ? 'border-code-blue bg-code-blue text-canvas'
          : 'border-code-blue-100 bg-canvas text-code-blue hover:border-insight hover:bg-insight-50',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={cx('text-xs', selected ? 'text-pulse-lime' : 'text-code-blue/60')}>{count}</span>
      )}
    </button>
  );
}
