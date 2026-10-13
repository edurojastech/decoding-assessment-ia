import { cx } from './cx.js';

// DS (design-system-decoding.vercel.app/icones): Tabler Icons na interface, traço 1.5.
// Decorativo por padrão: o texto ao lado (ou um sr-only) dá o nome.
// Cor: Code Blue ou Insight no claro; Lime só no escuro (nunca Insight sobre os tints Insight).
export function Icon({ icon: Glyph, size = 20, stroke = 1.5, className, ...props }) {
  return <Glyph size={size} stroke={stroke} aria-hidden="true" className={cx('shrink-0', className)} {...props} />;
}
