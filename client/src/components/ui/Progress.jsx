import { cx } from './cx.js';

const SIZES = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

// DS: barra com gradiente Insight → Lime. Usada no questionário e na cobertura.
// `hideLabel`: o rótulo fica só para leitores de tela (o card ao redor já o mostra).
export function Progress({ value = 0, label, showValue = true, hideLabel = false, size = 'md', className }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {((label && !hideLabel) || showValue) && (
        <div className="flex items-baseline justify-between gap-2 text-sm">
          {label && !hideLabel && <span className="text-label text-code-blue/70">{label}</span>}
          {showValue && <span className="font-semibold text-code-blue">{pct}%</span>}
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
          className="h-full rounded-full bg-insight-lime transition-[width] duration-[400ms] ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
