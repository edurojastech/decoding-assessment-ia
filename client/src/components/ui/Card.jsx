import { cx } from './cx.js';

const STRIPES = {
  gradient: 'bg-insight-lime',
  dark: 'bg-deep-blue',
};

// DS: card básico (variant="basic") ou com faixa de gradiente no topo ("gradient" | "dark").
export function Card({ variant = 'basic', as: Comp = 'div', className, children, ...props }) {
  const stripe = STRIPES[variant];
  return (
    <Comp
      className={cx('relative overflow-hidden rounded-xl bg-canvas shadow-md', className)}
      {...props}
    >
      {stripe && <div aria-hidden="true" className={cx('h-1.5 w-full', stripe)} />}
      {children}
    </Comp>
  );
}

export function CardBody({ className, ...props }) {
  return <div className={cx('p-6', className)} {...props} />;
}
