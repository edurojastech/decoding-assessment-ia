import { Link } from 'react-router';
import { cx } from './cx.js';
import { Icon } from './Icon.jsx';

// KPI do dashboard (specs/07): ícone + label pequeno, número grande em peso leve e legenda.
// Ícone em Insight (DS: fundo claro → ícones Insight). Com `to`, o card inteiro vira link
// (ex.: lista de participantes filtrada pelo status).
export function KpiCard({ icon, label, value, caption, to, children, className }) {
  const body = (
    <>
      <p className="flex items-center gap-2 text-sm text-code-blue/80">
        {icon && <Icon icon={icon} className="h-5 w-5 text-insight" />}
        {label}
      </p>
      <p className="mt-3 text-[2.5rem] leading-none font-light">{value}</p>
      {caption && <p className="mt-2 text-xs text-code-blue/70">{caption}</p>}
      {children && <div className="mt-4">{children}</div>}
    </>
  );
  const base = cx('block rounded-lg border border-border-default bg-canvas p-5', className);
  if (!to) return <div className={base}>{body}</div>;
  return (
    <Link to={to} className={cx(base, 'transition-[box-shadow,border-color] duration-150 hover:border-insight hover:bg-code-blue-50')}>
      {body}
    </Link>
  );
}
