import { useId } from 'react';
import { cx } from './cx.js';

// DS: textarea com o mesmo visual do Input (label, dica e erro).
export function Textarea({ label, hint, error, className, id, rows = 6, ...props }) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {label && <label htmlFor={textareaId} className="text-label text-code-blue">{label}</label>}
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(hintId, errorId) || undefined}
        className={cx(
          'w-full rounded-lg border bg-canvas px-4 py-3 text-base text-code-blue',
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
