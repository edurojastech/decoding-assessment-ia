import { useId } from 'react';
import { cx } from './cx.js';
import { fieldControl, fieldError, fieldHint, fieldLabel, fieldWrap } from './field.js';

// DS: textarea com o mesmo visual do Input (/componentes/inputs).
export function Textarea({ label, hint, error, className, id, rows = 6, ...props }) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className={cx(fieldWrap, className)}>
      {label && <label htmlFor={textareaId} className={fieldLabel}>{label}</label>}
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(hintId, errorId) || undefined}
        className={fieldControl(error)}
        {...props}
      />
      {hint && !error && <p id={hintId} className={fieldHint}>{hint}</p>}
      {error && <p id={errorId} className={fieldError}>{error}</p>}
    </div>
  );
}
