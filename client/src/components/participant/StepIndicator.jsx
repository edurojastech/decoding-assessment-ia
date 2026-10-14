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

export function StepIndicator({ current, questionCount = 24, className }) {
  const currentIndex = PARTICIPANT_STEPS.findIndex((s) => s.key === current);
  const hint = (step, i) => {
    if (i < currentIndex) return 'Concluído';
    if (i === currentIndex) return step.key === 'result' ? 'Pronta' : 'Em andamento';
    if (step.key === 'questions') return `${questionCount} perguntas`;
    if (step.key === 'result') return 'Seu diagnóstico';
    return '';
  };
  return (
    <nav aria-label="Etapas do diagnóstico" className={className}>
      <ol className="flex items-center gap-3">
        {PARTICIPANT_STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step.key} className="flex flex-1 items-center gap-3 last:flex-none">
              <span aria-current={active ? 'step' : undefined} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cx(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    done && 'bg-pulse-lime text-code-blue',
                    active && 'bg-code-blue text-canvas',
                    !done && !active && 'bg-code-blue-100 text-code-blue/70',
                  )}
                >
                  {done ? <Icon icon={IconCheck} size={18} stroke={2.5} /> : i + 1}
                </span>
                <span className={cx('flex-col leading-tight', active ? 'flex' : 'hidden md:flex')}>
                  <span className={cx('text-sm whitespace-nowrap', active || done ? 'font-semibold text-code-blue' : 'text-code-blue/80')}>
                    {step.label}
                  </span>
                  <span className="text-xs whitespace-nowrap text-code-blue/70">{hint(step, i)}</span>
                </span>
              </span>
              {i < PARTICIPANT_STEPS.length - 1 && (
                <span aria-hidden="true" className={cx('h-0.5 flex-1 rounded-full', done ? 'bg-pulse-lime' : 'bg-code-blue-100')} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
