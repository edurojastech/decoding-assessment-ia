import { cx } from './cx.js';

const STRIPES = {
  gradient: 'bg-insight-lime', // Degradê 02 (Insight → Lime)
  dark: 'bg-mesh-dark', // Degradê 01 (Mesh Escuro)
};

// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/cards
// Bloco discreto: raio 12px, borda 1px #E0E5FA, sem sombra (sombra só em menus flutuantes);
// faixa de gradiente de 8px no topo ("gradient" | "dark"). Use card só para destaques, não para toda seção.
export function Card({ variant = 'basic', as: Comp = 'div', className, children, ...props }) {
  const stripe = STRIPES[variant];
  return (
    <Comp
      className={cx('relative rounded-lg border border-border-default bg-canvas', stripe && 'overflow-hidden', className)}
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
