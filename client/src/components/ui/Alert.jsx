import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconInfoCircle } from '@tabler/icons-react';
import { cx } from './cx.js';
import { Icon } from './Icon.jsx';

// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/alertas
// Fundo tint + borda esquerda de 4px na cor semântica, raio 16px, ícone (Tabler) + título + texto.
// Exceção de acessibilidade: no Info, o texto usa o tom do título (#1A6FA8), porque o #3D94CC do DS
// não atinge contraste 4.5:1 sobre o fundo.
const VARIANTS = {
  info: { box: 'border-[#77C6F9] bg-[#EDF8FE]', title: 'text-[#1A6FA8]', text: 'text-[#1A6FA8]', icon: 'text-[#1A6FA8]', glyph: IconInfoCircle },
  success: { box: 'border-[#22C55E] bg-[#F0FDF4]', title: 'text-[#166534]', text: 'text-[#15803D]', icon: 'text-[#15803D]', glyph: IconCircleCheck },
  warning: { box: 'border-[#F59E0B] bg-[#FFFBEB]', title: 'text-[#92400E]', text: 'text-[#B45309]', icon: 'text-[#B45309]', glyph: IconAlertTriangle },
  error: { box: 'border-[#EF4444] bg-[#FFF5F5]', title: 'text-[#991B1B]', text: 'text-[#B91C1C]', icon: 'text-[#B91C1C]', glyph: IconCircleX },
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
