import { IconTrash } from '@tabler/icons-react';
import { cx } from './cx.js';

// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/botoes
// primary = Code Blue · secondary = Insight · accent = Pulse Lime · ghost = contorno 1.5px Code Blue · destructive = vermelho #EF4444 (Error do DS),
// sempre com ícone de lixeira (regra do projeto para toda ação de excluir).
const VARIANTS = {
  primary: 'bg-code-blue text-canvas hover:bg-code-blue/90',
  secondary: 'bg-insight text-code-blue hover:brightness-95',
  accent: 'bg-pulse-lime text-code-blue hover:brightness-95',
  ghost: 'border-[1.5px] border-code-blue bg-transparent text-code-blue hover:bg-code-blue-50',
  destructive: 'bg-error text-canvas hover:brightness-90',
};

// DS: sm px-3 py-1.5 text-xs raio 8px · md px-5 py-2.5 text-sm raio 12px · lg px-7 py-3.5 text-base raio 12px.
// (No @theme do projeto, rounded-md = 8px e rounded-lg = 12px.)
const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-7 py-3.5 text-base rounded-lg',
};

// DS: <Button variant="primary|secondary|accent|ghost|destructive" size="sm|md|lg" />.
// `as` permite renderizar como link (ex.: <Button as={Link} to="..." />).
export function Button({
  variant = 'primary', size = 'md', as: Comp = 'button', className, disabled, type, children, ...props
}) {
  return (
    <Comp
      type={Comp === 'button' ? type ?? 'button' : undefined}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={cx(
        'inline-flex cursor-pointer items-center justify-center gap-2 font-semibold',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-insight focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {variant === 'destructive' && <IconTrash size={size === 'sm' ? 16 : 18} stroke={2} aria-hidden="true" className="shrink-0" />}
      {children}
    </Comp>
  );
}
