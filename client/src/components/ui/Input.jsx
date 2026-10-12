import { useId } from 'react';
import { cx } from './cx.js';

// DS: input com label, dica opcional e estado de erro.
export function Input({ label, hint, error, className, id, ...props }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {label && <label htmlFor={inputId} className="text-label text-code-blue">{label}</label>}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(hintId, errorId) || undefined}
        className={cx(
          'h-11 w-full rounded-lg border bg-canvas px-4 text-base text-code-blue',
          'placeholder:text-code-blue-300 transition-[border-color,box-shadow] duration-150',
          'focus:outline-none focus:ring-4',
          error
            ? 'border-error focus:ring-error/15'
            : 'border-code-blue-200 focus:border-insight focus:ring-insight-100',
        )}
        {...props}
      />
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
