import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconInfoCircle } from '@tabler/icons-react';
import { cx } from './cx.js';
import { Icon } from './Icon.jsx';

// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/alertas
// Fundo tint + borda esquerda de 4px na cor semântica, raio 16px, ícone (Tabler) + título + texto.
// Exceção de acessibilidade: no Info, o texto usa o tom do título (#1A6FA8), porque o #3D94CC do DS
// não atinge contraste 4.5:1 sobre o fundo.
const VARIANTS = {
  info: { box: 'border-insight bg-insight-50', title: 'text-insight-700', text: 'text-insight-700', icon: 'text-insight-700', glyph: IconInfoCircle },
  success: { box: 'border-success bg-success-50', title: 'text-success-800', text: 'text-success-700', icon: 'text-success-700', glyph: IconCircleCheck },
  warning: { box: 'border-warning bg-warning-50', title: 'text-warning-800', text: 'text-warning-700', icon: 'text-warning-700', glyph: IconAlertTriangle },
  error: { box: 'border-error bg-error-50', title: 'text-error-800', text: 'text-error-700', icon: 'text-error-700', glyph: IconCircleX },
};

export function Alert({ variant = 'info', title, className, children, ...props }) {
  const v = VARIANTS[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cx('flex gap-3 rounded-xl border-l-4 p-4', v.box, className)}
      {...props}
    >
      <Icon icon={v.glyph} className={cx('mt-0.5 h-5 w-5', v.icon)} />
      <div className={cx('min-w-0 text-sm', v.text)}>
        {title && <p className={cx('font-semibold', v.title)}>{title}</p>}
        {children && <div className={title ? 'mt-0.5' : undefined}>{children}</div>}
      </div>
    </div>
  );
}
