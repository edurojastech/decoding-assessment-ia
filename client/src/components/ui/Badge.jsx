import { cx } from './cx.js';

// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/badges
// 6 variantes, pílula 10px em caixa alta (0.05em). Cores semânticas só para estado, sempre com texto.
const VARIANTS = {
  default: 'bg-code-blue-100 text-code-blue-700',
  info: 'bg-insight-100 text-insight-700',
  success: 'bg-success-100 text-success-800',
  pending: 'bg-warning-100 text-warning-800',
  error: 'bg-error-100 text-error-800',
  highlight: 'bg-lime-100 text-lime-800',
};

export function Badge({ variant = 'default', className, ...props }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase whitespace-nowrap',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
