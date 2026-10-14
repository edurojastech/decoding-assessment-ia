import { IconCheck } from '@tabler/icons-react';
import { cx } from './cx.js';
import { Icon } from './Icon.jsx';

// Alternativa do questionário em linha limpa (sem card): atalho numérico, texto e check quando marcada.
// Radio nativo escondido: setas e Tab continuam funcionando; o número é o atalho de teclado (1 a N).
export function ChoiceRow({ shortcut, checked = false, className, children, ...props }) {
  return (
    <label
      className={cx(
        'group flex cursor-pointer items-center gap-5 rounded-xl px-3 py-4 text-lg text-code-blue sm:px-4',
        'transition-colors duration-150',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-insight',
        checked ? 'border-transparent bg-insight-50' : 'hover:bg-code-blue-50',
        className,
      )}
    >
      <input type="radio" checked={checked} className="sr-only" {...props} />
      <span
        aria-hidden="true"
        className={cx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-semibold transition-colors duration-150',
          checked ? 'bg-insight text-code-blue' : 'bg-code-blue-50 text-code-blue/70 group-hover:bg-code-blue-100',
        )}
      >
        {shortcut}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {checked && (
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-code-blue text-canvas">
          <Icon icon={IconCheck} size={16} stroke={2.5} />
        </span>
      )}
    </label>
  );
}
