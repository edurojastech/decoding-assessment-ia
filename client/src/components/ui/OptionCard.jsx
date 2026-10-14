import { IconCheck } from '@tabler/icons-react';
import { cx } from './cx.js';
import { Icon } from './Icon.jsx';

// Opção selecionável em card (radio ou checkbox nativo, acessível por teclado).
// `variant="plain"`: sem borda nem fundo, para linhas soltas no fundo claro (ex.: consentimento).
export function OptionCard({
  type = 'radio', checked = false, hint, variant = 'card', className, children, ...props
}) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-start gap-3 rounded-lg text-base text-code-blue',
        'transition-[border-color,background-color] duration-150',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-insight',
        variant === 'plain'
          ? 'py-1'
          : cx('border p-4', checked ? 'border-insight bg-insight-50' : 'border-code-blue-100 bg-canvas hover:border-code-blue-200'),
        className,
      )}
    >
      <input type={type} checked={checked} className="sr-only" {...props} />
      <span
        aria-hidden="true"
        className={cx(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors duration-150',
          type === 'radio' ? 'rounded-full' : 'rounded-sm',
          checked ? 'border-code-blue bg-code-blue' : 'border-code-blue-200 bg-canvas',
        )}
      >
        {checked && type === 'radio' && <span className="h-2 w-2 rounded-full bg-canvas" />}
        {checked && type === 'checkbox' && (
          // Marca de 14px: traço mais grosso que o padrão 1.5 para continuar legível.
          <Icon icon={IconCheck} stroke={3} className="h-3.5 w-3.5 text-canvas" />
        )}
      </span>
      <span className="min-w-0">
        {children}
        {hint && <span className="mt-1 block text-sm text-code-blue/70">{hint}</span>}
      </span>
    </label>
  );
}
