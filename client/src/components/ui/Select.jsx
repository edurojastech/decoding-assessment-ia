import { useId } from 'react';
import { cx } from './cx.js';

// DS: select com o mesmo visual do Input (label, dica e erro).
export function Select({ label, hint, error, className, id, children, ...props }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {label && <label htmlFor={selectId} className="text-label text-code-blue">{label}</label>}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(hintId, errorId) || undefined}
          className={cx(
            'h-11 w-full appearance-none rounded-lg border bg-canvas pl-4 pr-10 text-base text-code-blue',
            'transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-4',
            error
              ? 'border-error focus:ring-error/15'
              : 'border-code-blue-200 focus:border-insight focus:ring-insight-100',
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-insight"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {hint && !error && <p id={hintId} className="text-sm text-code-blue/70">{hint}</p>}
      {error && (
        <p id={errorId} className="flex items-center gap-2 text-sm font-semibold text-code-blue">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-error" />
          {error}
        </p>
      )}
    </div>
  );
}
