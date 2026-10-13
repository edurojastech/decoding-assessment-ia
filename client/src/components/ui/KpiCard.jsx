import { Link } from 'react-router';
import { cx } from './cx.js';

// KPI do dashboard (specs/07): ícone + label pequeno, número grande em peso leve e legenda.
// Com `to`, o card inteiro vira link (ex.: lista de participantes filtrada pelo status).
export function KpiCard({ icon: Icon, label, value, caption, to, children, className }) {
  const body = (
    <>
      <p className="flex items-center gap-2 text-sm text-code-blue/80">
        {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-code-blue/70" />}
        {label}
      </p>
      <p className="mt-3 text-[40px] leading-none font-light">{value}</p>
      {caption && <p className="mt-2 text-xs text-code-blue/70">{caption}</p>}
      {children && <div className="mt-4">{children}</div>}
    </>
  );
  const base = cx('block rounded-xl border border-code-blue-100 bg-canvas p-5 shadow-sm', className);
  if (!to) return <div className={base}>{body}</div>;
  return (
    <Link to={to} className={cx(base, 'transition-[box-shadow,border-color] duration-150 hover:border-insight hover:shadow-md')}>
      {body}
    </Link>
  );
}
