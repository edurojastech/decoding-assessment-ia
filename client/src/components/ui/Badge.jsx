import { cx } from './cx.js';

// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/badges
// 6 variantes, pílula 10px em caixa alta (0.05em). Cores semânticas só para estado, sempre com texto.
const VARIANTS = {
  default: 'bg-[#E0E5FA] text-[#2338A8]',
  info: 'bg-[#D8F0FD] text-[#1A6FA8]',
  success: 'bg-[#DCFCE7] text-[#166534]',
  pending: 'bg-[#FEF3C7] text-[#92400E]',
  error: 'bg-[#FEE2E2] text-[#991B1B]',
  highlight: 'bg-[#F5FEDF] text-[#5B6E00]',
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
