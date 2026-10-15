import { Link } from 'react-router';
import { cx } from './cx.js';
import { Icon } from './Icon.jsx';

// Faixa compacta de indicadores (substitui as caixas grandes com sombra): uma linha com divisores.
// `items`: [{ key, icon, label, value, caption, to, children }]. Com `to`, a célula vira link.
export function KpiStrip({ items, className }) {
  return (
    <ul className={cx('grid grid-cols-2 overflow-hidden rounded-lg border border-border-default bg-canvas lg:grid-cols-4', className)}>
      {items.map(({ key, icon, label, value, caption, to, children }, i) => {
        const body = (
          <>
            <p className="flex items-center gap-2 text-sm text-code-blue/80">
              {icon && <Icon icon={icon} className="h-4 w-4 text-insight" />}
              {label}
            </p>
            <p className="mt-1 text-[1.75rem] leading-tight font-semibold">{value}</p>
            {caption && <p className="text-xs text-code-blue/70">{caption}</p>}
            {children && <div className="mt-2">{children}</div>}
          </>
        );
        const cell = 'block h-full px-5 py-4';
        return (
          <li
            key={key ?? label}
            className={cx('border-code-blue-100', i % 2 === 1 && 'border-l', i >= 2 && 'border-t lg:border-t-0', i === 2 && 'lg:border-l')}
          >
            {to
              ? <Link to={to} className={cx(cell, 'transition-colors duration-150 hover:bg-code-blue-50')}>{body}</Link>
              : <div className={cell}>{body}</div>}
          </li>
        );
      })}
    </ul>
  );
}
