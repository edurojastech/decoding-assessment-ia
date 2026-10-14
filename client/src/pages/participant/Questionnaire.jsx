import { useEffect, useRef, useState } from 'react';
import { IconArrowLeft, IconArrowRight, IconCheck, IconKeyboard } from '@tabler/icons-react';
import { api } from '../../lib/api.js';
import { Logo } from '../../components/Logo.jsx';
import { Alert, Button, ChoiceRow, Icon, Progress } from '../../components/ui/index.js';
import { cx } from '../../components/ui/cx.js';
import { DIMENSION_ICONS } from '../../components/participant/dimensionIcons.js';
import { StepIndicator } from '../../components/participant/StepIndicator.jsx';

const SECONDS_PER_QUESTION = 25; // 24 perguntas ≈ 10 min, dentro dos "9 a 12 minutos" do original

// Anel de progresso da barra lateral (fundo escuro): trilho branco translúcido, arco Insight → Lime.
function ProgressRing({ value, total }) {
  const r = 52;
  const length = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  const minutes = Math.ceil(((total - value) * SECONDS_PER_QUESTION) / 60);
  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="anel-progresso" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--insight)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--pulse-lime)' }} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="7" style={{ stroke: 'var(--canvas)', strokeOpacity: 0.12 }} />
        <circle
          cx="60" cy="60" r={r} fill="none" strokeWidth="7" strokeLinecap="round" stroke="url(#anel-progresso)"
          strokeDasharray={length} strokeDashoffset={length * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0,0,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center leading-tight">
        <span className="text-2xl font-bold">{value} de {total}</span>
        <span className="text-sm text-canvas/80">perguntas</span>
        <span className="mt-2 text-xs text-canvas/70">
          {value >= total ? 'tudo respondido' : `cerca de ${minutes} min restantes`}
        </span>
      </div>
    </div>
  );
}

// RF-10: questionário progressivo — uma dimensão por vez (original, seção 2), com progresso e opção de voltar.
// Redesign: dentro da dimensão, uma pergunta por tela, com avanço automático ao responder e atalhos 1–N.
// A barra lateral mostra só a dimensão em curso como ativa; as perguntas de outra dimensão nunca aparecem juntas.
// As perguntas de perfil (P0a–P0c) ficam na etapa "Seu perfil" (Identify.jsx).
// Toda pergunta precisa de uma resposta para avançar ("Não sei" conta como resposta). O backend segue tratando
// respostas parciais (RN-07/RN-08) por segurança. O front só coleta escolhas; a pontuação é no backend (regra 1).
export default function Questionnaire({
  token, questionnaire, answers, onAnswersChange, onBackToIdentify, onSubmitted,
}) {
  const { dimensions, notSure } = questionnaire;
  const allQuestions = dimensions.flatMap((d) => d.questions.map((q) => ({ ...q, dimensionId: d.id })));
  const total = allQuestions.length;

  // Começa na primeira pergunta sem resposta (rascunho recarregado continua de onde parou).
  const [index, setIndex] = useState(() => {
    const first = allQuestions.findIndex((q) => !answers[q.id]);
    return first === -1 ? total - 1 : first;
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const advanceTimer = useRef(null);
  const groupRef = useRef(null);

  const question = allQuestions[index];
  const dimIndex = dimensions.findIndex((d) => d.id === question.dimensionId);
  const dimension = dimensions[dimIndex];
  const options = question.allowsNotSure ? [...question.options, notSure] : question.options;
  const answeredCount = allQuestions.filter((q) => answers[q.id]).length;
  const isLast = index === total - 1;
  const answered = Boolean(answers[question.id]);
  // Só dá para ir até a primeira pergunta ainda sem resposta (não se pula pergunta).
  const firstOpen = allQuestions.findIndex((q) => !answers[q.id]);
  const maxReachable = firstOpen === -1 ? total - 1 : firstOpen;
  const allAnswered = firstOpen === -1;

  useEffect(() => () => clearTimeout(advanceTimer.current), []);
  useEffect(() => {
    window.scrollTo(0, 0);
    groupRef.current?.focus({ preventScroll: true });
  }, [index]);

  function goTo(next) {
    clearTimeout(advanceTimer.current);
    setError('');
    setIndex(Math.max(0, Math.min(maxReachable, total - 1, next)));
  }

  function choose(key) {
    onAnswersChange({ ...answers, [question.id]: key });
    clearTimeout(advanceTimer.current);
    if (!isLast) {
      advanceTimer.current = setTimeout(() => {
        setError('');
        setIndex(index + 1);
      }, 350);
    }
  }

  function handleKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const n = Number(event.key) - 1;
    if (Number.isInteger(n) && n >= 0 && n < options.length) {
      event.preventDefault();
      choose(options[n].key);
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
    if (!answered) return setError('Escolha uma opção para continuar.');
    if (!isLast) return goTo(index + 1);
    if (!allAnswered) return goTo(firstOpen);
    return submit();
  }

  const firstIndexOf = (dimensionId) => allQuestions.findIndex((q) => q.dimensionId === dimensionId);
  const positionInDimension = index - firstIndexOf(dimension.id) + 1;

  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      {/* Barra lateral escura (Degradê 01): marca, dimensões e progresso */}
      <aside className="hidden w-[22rem] shrink-0 flex-col justify-between gap-8 bg-mesh-dark px-8 py-10 text-canvas lg:flex">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <Logo tone="onDark" />
            <p className="text-label leading-relaxed text-insight">Assessment de<br />maturidade em IA</p>
          </div>
          <ol className="flex flex-col gap-1" aria-label="Dimensões">
            {dimensions.map((d, i) => {
              const answered = d.questions.filter((q) => answers[q.id]).length;
              const complete = answered === d.questions.length;
              const active = i === dimIndex;
              const DimIcon = DIMENSION_ICONS[d.id];
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => goTo(firstIndexOf(d.id))}
                    disabled={firstIndexOf(d.id) > maxReachable}
                    aria-current={active ? 'step' : undefined}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-150',
                      'cursor-pointer disabled:cursor-default',
                      active ? 'bg-canvas/10' : 'enabled:hover:bg-canvas/5',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        complete ? 'bg-pulse-lime text-code-blue' : active ? 'bg-insight text-code-blue' : 'border border-canvas/40 text-canvas/80',
                      )}
                    >
                      {complete ? <Icon icon={IconCheck} size={14} stroke={3} /> : i + 1}
                    </span>
                    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-canvas/30">
                      {DimIcon && <Icon icon={DimIcon} size={20} />}
                    </span>
                    <span className={cx('flex-1', active ? 'font-semibold' : 'text-canvas/85')}>{d.name}</span>
                    <span className="text-sm text-canvas/70">{answered} / {d.questions.length}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <ProgressRing value={answeredCount} total={total} />
        </div>
        <p className="text-label text-canvas/70">
          IA First. <span className="text-pulse-lime">Human Driven.</span>
        </p>
      </aside>

      {/* Topo no celular: marca e progresso */}
      <header className="flex items-center justify-between gap-4 border-b border-code-blue-100 bg-canvas px-4 py-4 lg:hidden">
        <Logo />
        <span className="text-sm text-code-blue/70">{answeredCount} de {total}</span>
      </header>

      <main className="flex flex-1 flex-col px-4 py-8 sm:px-8 lg:px-16 lg:py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
          {/* Jornada em 4 passos: mesma barra das outras etapas */}
          <StepIndicator current="questions" questionCount={total} className="mb-8 lg:mb-10" />
          <div className="flex flex-col gap-3">
            <p className="text-label text-code-blue/70">
              Dimensão {dimIndex + 1} de {dimensions.length} · {dimension.name} · Pergunta {index + 1} de {total}
            </p>
            <Progress label="Progresso do questionário" hideLabel showValue={false} size="lg" value={(answeredCount / total) * 100} />
          </div>

          <section
            key={question.id}
            ref={groupRef}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            aria-labelledby={`${question.id}-texto`}
            className="mt-6 flex flex-col gap-6 outline-none lg:mt-8"
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm text-code-blue/70">{dimension.name} · {positionInDimension} de {dimension.questions.length}</p>
              <h1 id={`${question.id}-texto`} className="text-3xl leading-tight lg:text-[2.75rem]">{question.text}</h1>
            </div>
            <div role="radiogroup" aria-labelledby={`${question.id}-texto`} className="flex flex-col">
              {options.map((o, i) => (
                <ChoiceRow
                  key={o.key}
                  shortcut={i + 1}
                  name={question.id}
                  value={o.key}
                  checked={answers[question.id] === o.key}
                  onChange={() => choose(o.key)}
                  className="border-b border-code-blue-100 last:border-b-0"
                >
                  {o.label}
                </ChoiceRow>
              ))}
            </div>
          </section>

          {error && <Alert variant="error" className="mt-6">{error}</Alert>}

          <div className="mt-8 flex flex-col gap-4 border-t border-code-blue-100 pt-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={busy}
                onClick={() => (index === 0 ? onBackToIdentify() : goTo(index - 1))}
                className="inline-flex cursor-pointer items-center justify-center gap-2 py-2 text-lg font-semibold text-code-blue hover:underline disabled:opacity-50"
              >
                <Icon icon={IconArrowLeft} size={20} />
                {index === 0 ? 'Seu perfil' : 'Anterior'}
              </button>
              <Button variant={isLast ? 'accent' : 'primary'} size="lg" disabled={busy || !answered} onClick={handleNext} className="sm:min-w-48">
                {busy ? 'Enviando…' : isLast ? 'Enviar respostas' : 'Próxima'}
                {!busy && <Icon icon={IconArrowRight} size={20} />}
              </Button>
            </div>
            <p className="hidden items-center gap-2 text-sm text-code-blue/70 md:flex">
              <Icon icon={IconKeyboard} size={18} />
              {answered ? `Pressione 1 a ${options.length} para trocar a resposta.` : `Escolha uma opção para continuar. Pressione 1 a ${options.length} para responder.`}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
