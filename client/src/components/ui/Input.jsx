import { useId } from 'react';
import { cx } from './cx.js';
import { fieldControl, fieldError, fieldHint, fieldLabel, fieldWrap } from './field.js';

// DS: input com label, dica opcional e estado de erro (/componentes/inputs).
export function Input({ label, hint, error, className, id, ...props }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cx(fieldWrap, className)}>
      {label && <label htmlFor={inputId} className={fieldLabel}>{label}</label>}
      <input
        id={inputId}
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
