import { cx } from './cx.js';

// DS: 6 variantes. Cores semânticas só para estado, sempre com texto (Code Blue, para contraste).
const VARIANTS = {
  default: 'bg-code-blue-50 text-code-blue',
  info: 'bg-insight-100 text-code-blue',
  success: 'bg-success/20 text-code-blue',
  pending: 'bg-warning/20 text-code-blue',
  error: 'bg-error/15 text-code-blue',
  highlight: 'bg-pulse-lime text-code-blue',
};

export function Badge({ variant = 'default', className, ...props }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
