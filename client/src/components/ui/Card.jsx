import { cx } from './cx.js';

const STRIPES = {
  gradient: 'bg-insight-lime', // Degradê 02 (Insight → Lime)
  dark: 'bg-mesh-dark', // Degradê 01 (Mesh Escuro)
};

// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/cards
// Raio 24px, borda 1px #E0E5FA, sombra de card; faixa de gradiente de 8px no topo ("gradient" | "dark").
export function Card({ variant = 'basic', as: Comp = 'div', className, children, ...props }) {
  const stripe = STRIPES[variant];
  return (
    <Comp
      className={cx('relative overflow-hidden rounded-2xl border border-border-default bg-canvas shadow-card', className)}
      {...props}
    >
      {stripe && <div aria-hidden="true" className={cx('h-2 w-full', stripe)} />}
      {children}
    </Comp>
  );
}

export function CardBody({ className, ...props }) {
  return <div className={cx('p-6', className)} {...props} />;
}
