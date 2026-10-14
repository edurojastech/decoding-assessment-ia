import { cx } from '../ui/cx.js';
import { LEVELS } from './LevelBadge.jsx';

// Régua dos 4 níveis de maturidade (RN-05) com o nível atual marcado. Para fundo escuro.
export function LevelScale({ level }) {
  const current = LEVELS.indexOf(level);
  return (
    <div className="flex flex-col gap-2" aria-label={level ? `Nível atual: ${level}` : undefined}>
      <div aria-hidden="true" className="relative flex items-center justify-between px-1">
        <span className="absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 bg-canvas/25" />
        {current > 0 && (
          <span
            className="absolute left-1 top-1/2 h-0.5 -translate-y-1/2 bg-canvas"
            style={{ width: `calc(${(current / (LEVELS.length - 1)) * 100}% - 0.5rem)` }}
          />
        )}
        {LEVELS.map((l, i) => (
          <span
            key={l}
            className={cx(
              'relative rounded-full',
              i === current ? 'h-4 w-4 border-[3px] border-code-blue bg-pulse-lime ring-2 ring-pulse-lime' : 'h-2.5 w-2.5',
              i < current && 'bg-canvas',
              i > current && 'bg-canvas/40',
            )}
          />
        ))}
      </div>
      <ol className="flex justify-between gap-2 text-xs">
        {LEVELS.map((l, i) => (
          <li key={l} className={cx(i === current ? 'font-semibold text-pulse-lime' : 'text-canvas/70')}>{l}</li>
        ))}
      </ol>
    </div>
  );
}
