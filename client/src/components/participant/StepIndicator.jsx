import { IconCheck } from '@tabler/icons-react';
import { cx } from '../ui/cx.js';
import { Icon } from '../ui/Icon.jsx';

// Jornada do participante em 4 passos (redesign: boas-vindas → perfil → perguntas → devolutiva).
export const PARTICIPANT_STEPS = [
  { key: 'welcome', label: 'Boas-vindas' },
  { key: 'profile', label: 'Seu perfil' },
  { key: 'questions', label: 'Perguntas' },
  { key: 'result', label: 'Devolutiva' },
];

export function StepIndicator({ current, className }) {
  const currentIndex = PARTICIPANT_STEPS.findIndex((s) => s.key === current);
  return (
    <nav aria-label="Etapas do diagnóstico" className={className}>
      <ol className="flex items-center gap-2 sm:gap-3">
        {PARTICIPANT_STEPS.map((step, i) => {
          const done = i < currentIndex || current === 'result';
          const active = i === currentIndex && current !== 'result';
          return (
            <li key={step.key} className="flex flex-1 items-center gap-2 sm:gap-3 last:flex-none">
              <span
                aria-current={active ? 'step' : undefined}
                className="flex items-center gap-2"
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    done && 'bg-pulse-lime text-code-blue',
                    active && 'bg-code-blue text-canvas',
                    !done && !active && 'bg-code-blue-100 text-code-blue/70',
                  )}
                >
                  {done ? <Icon icon={IconCheck} size={16} stroke={2.5} /> : i + 1}
                </span>
                <span className={cx('text-sm whitespace-nowrap', active ? 'font-semibold text-code-blue' : 'hidden text-code-blue/70 md:inline')}>
                  {step.label}
                  {done && <span className="sr-only"> (concluída)</span>}
                </span>
              </span>
              {i < PARTICIPANT_STEPS.length - 1 && (
                <span aria-hidden="true" className={cx('h-px flex-1', done ? 'bg-lime-900/40' : 'bg-code-blue-100')} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
