import { useId } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { cx } from './cx.js';
import { Icon } from './Icon.jsx';
import { fieldControl, fieldError, fieldHint, fieldLabel, fieldWrap } from './field.js';

// DS: select com o mesmo visual do Input (/componentes/inputs); ícone à direita em #8AA0E8, como no DS.
export function Select({ label, hint, error, className, id, children, ...props }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={cx(fieldWrap, className)}>
      {label && <label htmlFor={selectId} className={fieldLabel}>{label}</label>}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(hintId, errorId) || undefined}
          className={cx(fieldControl(error), 'cursor-pointer appearance-none pr-10')}
          {...props}
        >
          {children}
        </select>
        <Icon
          icon={IconChevronDown}
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
        />
      </div>
      {hint && !error && <p id={hintId} className={fieldHint}>{hint}</p>}
      {error && <p id={errorId} className={fieldError}>{error}</p>}
    </div>
  );
}
