import { cx } from '../ui/cx.js';
import { LEVEL_TINTS } from '../charts/levelScale.jsx';

// Nível de maturidade (RN-05). Mesma escala de cor em badges, barras e mapas (charts/levelScale.jsx):
// tints de Code Blue do mais claro (Iniciante) ao Code Blue (Avançado). Nível não é estado: nunca cores semânticas.
export const LEVELS = Object.keys(LEVEL_TINTS);

export function LevelBadge({ level, className }) {
  if (!level) return null;
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-[0.05em] uppercase whitespace-nowrap',
        LEVEL_TINTS[level] ?? 'bg-code-blue-50',
        !LEVEL_TINTS[level]?.includes('text-') && 'text-code-blue',
        className,
      )}
    >
      {level}
    </span>
  );
}
