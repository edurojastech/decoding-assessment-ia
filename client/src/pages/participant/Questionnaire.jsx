import { useEffect, useRef, useState } from 'react';
import { IconArrowLeft, IconArrowRight, IconCheck, IconKeyboard } from '@tabler/icons-react';
import { api } from '../../lib/api.js';
import { ParticipantShell } from '../../components/ParticipantShell.jsx';
import { Alert, Button, ChoiceRow, Icon, Progress } from '../../components/ui/index.js';
import { cx } from '../../components/ui/cx.js';

// Anel de progresso da barra lateral (fundo escuro): trilho branco translúcido, arco Lime.
function ProgressRing({ value, total }) {
  const r = 52;
  const length = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" style={{ stroke: 'var(--canvas)', strokeOpacity: 0.12 }} />
        <circle
          cx="60" cy="60" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={length} strokeDashoffset={length * (1 - pct)}
          style={{ stroke: 'var(--pulse-lime)', transition: 'stroke-dashoffset 400ms cubic-bezier(0,0,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold">{value}<span className="text-base font-normal text-canvas/70"> de {total}</span></span>
        <span className="text-xs text-canvas/70">respondidas</span>
      </div>
    </div>
  );
}

// RF-10: questionário progressivo — uma dimensão por vez (original, seção 2), com progresso e opção de voltar.
// As perguntas de perfil (P0a–P0c) ficam na etapa "Seu perfil" (Identify.jsx).
// Nenhuma pergunta é obrigatória (RN-07/RN-08). O front só coleta escolhas; a pontuação é no backend (regra 1).
// Redesign: barra lateral com as dimensões, alternativas em linhas limpas, atalhos 1–N e rolagem
// automática para a próxima pergunta da dimensão.
export default function Questionnaire({
  token, questionnaire, answers, onAnswersChange, onBackToIdentify, onSubmitted,
}) {
  const { dimensions, notSure } = questionnaire;
  const allQuestions = dimensions.flatMap((d) => d.questions);
  const questionNumber = Object.fromEntries(allQuestions.map((q, i) => [q.id, i + 1]));

  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmBlank, setConfirmBlank] = useState(false);
  const questionRefs = useRef({});

  const answeredCount = allQuestions.filter((q) => answers[q.id]).length;
  const blanksByDimension = dimensions
    .map((d, i) => ({ step: i, name: d.name, count: d.questions.filter((q) => !answers[q.id]).length }))
    .filter((d) => d.count > 0);
  const blankCount = blanksByDimension.reduce((s, d) => s + d.count, 0);
  const isLast = stepIndex === dimensions.length - 1;
  const dimension = dimensions[stepIndex];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stepIndex]);

  function goTo(index) {
    setError('');
    setConfirmBlank(false);
    setStepIndex(index);
  }

  const optionsOf = (q) => (q.allowsNotSure ? [...q.options, notSure] : q.options);

  function choose(q, key) {
    const firstTime = !answers[q.id];
    onAnswersChange({ ...answers, [q.id]: key });
    if (!firstTime) return;
    // Próxima pergunta da dimensão entra em foco: o atalho numérico já vale para ela.
    const list = dimension.questions;
    const next = list[list.findIndex((x) => x.id === q.id) + 1];
    const target = next ? questionRefs.current[next.id] : questionRefs.current.__nav;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.focus({ preventScroll: true });
      }, 180);
    }
  }

  function handleShortcut(q, event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = Number(event.key) - 1;
    const options = optionsOf(q);
    if (Number.isInteger(index) && index >= 0 && index < options.length) {
      event.preventDefault();
      choose(q, options[index].key);
    }
  }

  async function submit() {
    setBusy(true);
    setError('');
    try {
      await api.post(`/r/${token}/submit`, { answers });
      onSubmitted();
    } catch (err) {
      if (err.status === 409) return onSubmitted();
      setError(err.message);
      setBusy(false);
    }
  }

  function handleNext() {
    if (!isLast) return goTo(stepIndex + 1);
    if (blankCount > 0 && !confirmBlank) return setConfirmBlank(true);
    return submit();
  }

  return (
    <ParticipantShell wide step="questions">
      <div className="grid gap-10 lg:grid-cols-[17.5rem_1fr] lg:gap-16">
        {/* Barra lateral: dimensões e progresso (bloco escuro, Degradê 01) */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 flex flex-col gap-6 rounded-3xl bg-mesh-dark p-6 text-canvas">
            <p className="text-label text-insight">Dimensões</p>
            <ol className="flex flex-col gap-1">
              {dimensions.map((d, i) => {
                const answered = d.questions.filter((q) => answers[q.id]).length;
                const complete = answered === d.questions.length;
                const active = i === stepIndex;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={active ? 'step' : undefined}
                      className={cx(
                        'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150',
                        active ? 'bg-canvas/10' : 'hover:bg-canvas/5',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cx(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          complete ? 'bg-pulse-lime text-code-blue' : active ? 'bg-insight text-code-blue' : 'border border-canvas/30 text-canvas/80',
                        )}
                      >
                        {complete ? <Icon icon={IconCheck} size={16} stroke={2.5} /> : i + 1}
                      </span>
                      <span className={cx('flex-1 text-sm', active ? 'font-semibold' : 'text-canvas/80')}>{d.name}</span>
                      <span className="text-xs text-canvas/70">{answered}/{d.questions.length}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <ProgressRing value={answeredCount} total={allQuestions.length} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          {/* Progresso sempre visível no topo da coluna */}
          <div className="sticky top-0 z-10 -mx-4 bg-surface/95 px-4 pt-2 pb-4 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-label text-code-blue/70">
                Dimensão {stepIndex + 1} de {dimensions.length} · {dimension.name}
              </p>
              <p className="text-sm text-code-blue/70">{answeredCount} de {allQuestions.length} respondidas</p>
            </div>
            <Progress label="Progresso do questionário" hideLabel showValue={false} size="sm" value={(answeredCount / allQuestions.length) * 100} />
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <h1 className="text-3xl sm:text-h2">{dimension.name}</h1>
            <p className="text-lg text-code-blue/80">{dimension.description}</p>
          </div>

          <div className="mt-4 flex flex-col">
            {dimension.questions.map((q) => {
              const options = optionsOf(q);
              return (
                <section
                  key={q.id}
                  ref={(el) => { questionRefs.current[q.id] = el; }}
                  tabIndex={-1}
                  onKeyDown={(e) => handleShortcut(q, e)}
                  aria-labelledby={`${q.id}-texto`}
                  className="flex scroll-mt-32 flex-col gap-4 border-b border-code-blue-100 py-8 outline-none last:border-b-0"
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-label text-code-blue/70">Pergunta {questionNumber[q.id]} de {allQuestions.length}</p>
                    <h2 id={`${q.id}-texto`} className="text-xl leading-snug font-bold tracking-normal sm:text-2xl">{q.text}</h2>
                  </div>
                  <div role="radiogroup" aria-labelledby={`${q.id}-texto`} className="flex flex-col gap-1">
                    {options.map((o, i) => (
                      <ChoiceRow
                        key={o.key}
                        shortcut={i + 1}
                        name={q.id}
                        value={o.key}
                        checked={answers[q.id] === o.key}
                        onChange={() => choose(q, o.key)}
                      >
                        {o.label}
                      </ChoiceRow>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {confirmBlank && (
            <Alert variant="warning" title={`Você deixou ${blankCount} ${blankCount === 1 ? 'pergunta' : 'perguntas'} em branco`} className="mt-4">
              <p>
                Quanto mais respostas, mais completa fica a sua devolutiva. Se faltar muita coisa, o resultado
                geral aparece como preenchimento incompleto.
              </p>
              <ul className="mt-2 list-disc pl-5">
                {blanksByDimension.map((d) => <li key={d.name}>{d.name}: {d.count} em branco</li>)}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" size="sm" onClick={() => goTo(blanksByDimension[0].step)}>
                  Revisar perguntas em branco
                </Button>
                <Button variant="ghost" size="sm" disabled={busy} onClick={submit}>Enviar assim mesmo</Button>
              </div>
            </Alert>
          )}

          {error && <Alert variant="error" className="mt-4">{error}</Alert>}

          <div
            ref={(el) => { questionRefs.current.__nav = el; }}
            tabIndex={-1}
            className="mt-6 flex flex-col-reverse gap-4 border-t border-code-blue-100 pt-8 outline-none sm:flex-row sm:items-center sm:justify-between"
          >
            <button
              type="button"
              disabled={busy}
              onClick={() => (stepIndex === 0 ? onBackToIdentify() : goTo(stepIndex - 1))}
              className="inline-flex cursor-pointer items-center justify-center gap-2 py-2 font-semibold text-code-blue hover:underline disabled:opacity-50"
            >
              <Icon icon={IconArrowLeft} size={20} />
              {stepIndex === 0 ? 'Seu perfil' : 'Dimensão anterior'}
            </button>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <p className="hidden items-center gap-2 text-sm text-code-blue/70 md:flex">
                <Icon icon={IconKeyboard} size={18} />
                Use as teclas 1 a {optionsOf(dimension.questions[0]).length} para responder
              </p>
              <Button variant={isLast ? 'accent' : 'primary'} size="lg" disabled={busy || confirmBlank} onClick={handleNext}>
                {busy ? 'Enviando…' : isLast ? 'Enviar respostas' : 'Próxima dimensão'}
                {!busy && <Icon icon={IconArrowRight} size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ParticipantShell>
  );
}
