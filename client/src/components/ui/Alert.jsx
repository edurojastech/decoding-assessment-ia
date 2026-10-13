import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconInfoCircle } from '@tabler/icons-react';
import { cx } from './cx.js';
import { Icon } from './Icon.jsx';

const VARIANTS = {
  info: { box: 'border-info bg-insight-50', icon: 'text-code-blue', glyph: IconInfoCircle },
  success: { box: 'border-success bg-success/10', icon: 'text-success', glyph: IconCircleCheck },
  warning: { box: 'border-warning bg-warning/10', icon: 'text-warning', glyph: IconAlertTriangle },
  error: { box: 'border-error bg-error/10', icon: 'text-error', glyph: IconCircleX },
};

// DS: alerta de feedback com borda esquerda colorida, ícone (Tabler) + texto.
export function Alert({ variant = 'info', title, className, children, ...props }) {
  const v = VARIANTS[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cx('flex gap-3 rounded-lg border-l-4 p-4 text-code-blue', v.box, className)}
      {...props}
    >
      <Icon icon={v.glyph} className={cx('mt-0.5 h-5 w-5', v.icon)} />
      <div className="min-w-0 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-1' : undefined}>{children}</div>}
      </div>
    </div>
  );
}
