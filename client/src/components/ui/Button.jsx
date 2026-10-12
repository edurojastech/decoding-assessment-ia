import { cx } from './cx.js';

const VARIANTS = {
  primary: 'bg-code-blue text-canvas hover:bg-code-blue/90',
  secondary: 'border border-code-blue-200 bg-canvas text-code-blue hover:bg-code-blue-50',
  accent: 'bg-pulse-lime text-code-blue hover:brightness-95',
  ghost: 'bg-transparent text-code-blue hover:bg-code-blue-50',
  destructive: 'bg-error text-canvas hover:brightness-90',
};

const SIZES = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

// DS: <Button variant="primary|secondary|accent|ghost|destructive" size="sm|md|lg" />.
// `as` permite renderizar como link (ex.: <Button as={Link} to="..." />).
export function Button({
  variant = 'primary', size = 'md', as: Comp = 'button', className, disabled, type, ...props
}) {
  return (
    <Comp
      type={Comp === 'button' ? type ?? 'button' : undefined}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
        'transition-[background-color,filter,opacity] duration-150',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
