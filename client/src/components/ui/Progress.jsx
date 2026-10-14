import { cx } from './cx.js';

// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/progresso
// Alturas 4/8/12px, trilho #E0E5FA, gradiente Insight → Lime, 400ms ease-out.
const SIZES = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

// `hideLabel`: o rótulo fica só para leitores de tela (o card ao redor já o mostra).
export function Progress({ value = 0, label, showValue = true, hideLabel = false, size = 'md', className }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {((label && !hideLabel) || showValue) && (
        <div className="flex items-baseline justify-between gap-2 text-sm font-medium">
          {label && !hideLabel && <span className="text-code-blue">{label}</span>}
          {showValue && <span className="text-text-secondary">{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className={cx('w-full overflow-hidden rounded-full bg-code-blue-100', SIZES[size])}
      >
        <div
          className="h-full rounded-full bg-insight-lime transition-[width] duration-[400ms] ease-[cubic-bezier(0,0,0.2,1)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
