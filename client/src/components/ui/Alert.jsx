import { cx } from './cx.js';

const ICON_PATHS = {
  info: 'M12 8h.01M11 12h1v4h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  success: 'M9 12l2 2 4-4M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  warning: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  error: 'M15 9l-6 6M9 9l6 6M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
};

const VARIANTS = {
  info: { box: 'border-info bg-insight-50', icon: 'text-code-blue' },
  success: { box: 'border-success bg-success/10', icon: 'text-success' },
  warning: { box: 'border-warning bg-warning/10', icon: 'text-warning' },
  error: { box: 'border-error bg-error/10', icon: 'text-error' },
};

// DS: alerta de feedback com borda esquerda colorida, ícone + texto.
export function Alert({ variant = 'info', title, className, children, ...props }) {
  const v = VARIANTS[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cx('flex gap-3 rounded-lg border-l-4 p-4 text-code-blue', v.box, className)}
      {...props}
    >
      <svg
        aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className={cx('mt-0.5 h-5 w-5 shrink-0', v.icon)}
      >
        <path d={ICON_PATHS[variant]} />
      </svg>
      <div className="min-w-0 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-1' : undefined}>{children}</div>}
      </div>
    </div>
  );
}
