import { IconCheck } from '@tabler/icons-react';
import { cx } from './cx.js';
import { Icon } from './Icon.jsx';

// Chip selecionável (checkbox nativo, acessível por teclado). Pílula do DS (/componentes/tags):
// neutro com contorno Code Blue 100; marcado em Code Blue com check.
export function ToggleChip({ checked = false, className, children, ...props }) {
  return (
    <label
      className={cx(
        'inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium',
        'transition-[border-color,background-color,color] duration-150',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-insight',
        checked
          ? 'border-code-blue bg-code-blue text-canvas'
          : 'border-code-blue-100 bg-canvas text-code-blue hover:border-code-blue-200',
        className,
      )}
    >
      <input type="checkbox" checked={checked} className="sr-only" {...props} />
      {checked && <Icon icon={IconCheck} size={16} stroke={2.5} />}
      {children}
    </label>
  );
}
