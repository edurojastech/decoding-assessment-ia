import { useState } from 'react';
import { api } from '../../lib/api.js';
import { ParticipantShell } from '../../components/ParticipantShell.jsx';
import { Alert, Button, Card, CardBody, Input, OptionCard, Progress } from '../../components/ui/index.js';

const NONE_TOOL = 'Nenhuma';

// RF-10: questionário progressivo — perfil (P0b, P0c) e depois uma dimensão por vez,
// com barra de progresso e opção de voltar. Nenhuma pergunta é obrigatória (RN-07/RN-08).
// O front só coleta escolhas; a pontuação é feita no backend (regra 1).
export default function Questionnaire({
  token, participant, questionnaire, answers, onAnswersChange, onParticipantChange, onBackToIdentify, onSubmitted,
}) {
  const { dimensions, notSure, profile } = questionnaire;
  const totalSteps = dimensions.length + 1;
  const allQuestions = dimensions.flatMap((d) => d.questions);
  const questionNumber = Object.fromEntries(allQuestions.map((q, i) => [q.id, i + 1]));

  const [stepIndex, setStepIndex] = useState(0);
  const [role, setRole] = useState(participant.role ?? '');
  const [tools, setTools] = useState(participant.tools ?? []);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmBlank, setConfirmBlank] = useState(false);

  const answeredCount = allQuestions.filter((q) => answers[q.id]).length;
  const blanksByDimension = dimensions
    .map((d, i) => ({ step: i + 1, name: d.name, count: d.questions.filter((q) => !answers[q.id]).length }))
    .filter((d) => d.count > 0);
  const blankCount = blanksByDimension.reduce((s, d) => s + d.count, 0);
  const isLast = stepIndex === totalSteps - 1;

  function goTo(index) {
    setError('');
    setConfirmBlank(false);
    setStepIndex(index);
    window.scrollTo(0, 0);
  }

  function toggleTool(tool, checked) {
    if (!checked) return setTools(tools.filter((t) => t !== tool));
    // "Nenhuma" não se combina com as demais ferramentas.
    setTools(tool === NONE_TOOL ? [NONE_TOOL] : [...tools.filter((t) => t !== NONE_TOOL), tool]);
  }

  async function saveProfileAndContinue() {
    setBusy(true);
    setError('');
    try {
      const { participant: updated } = await api.patch(`/r/${token}`, { role, tools });
      onParticipantChange(updated);
      goTo(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
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
    if (stepIndex === 0) return saveProfileAndContinue();
    if (!isLast) return goTo(stepIndex + 1);
    if (blankCount > 0 && !confirmBlank) return setConfirmBlank(true);
    return submit();
  }

  const dimension = stepIndex > 0 ? dimensions[stepIndex - 1] : null;

  return (
    <ParticipantShell>
      <Progress
        label={`Etapa ${stepIndex + 1} de ${totalSteps}`}
        value={((stepIndex + 1) / totalSteps) * 100}
        showValue={false}
      />
      <p className="mt-2 text-sm text-code-blue/70">{answeredCount} de {allQuestions.length} perguntas respondidas</p>

      {dimension ? (
        <>
          <p className="mt-8 text-label text-code-blue/70">Dimensão {stepIndex} de {dimensions.length}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">{dimension.name}</h1>
          <p className="mt-3 text-code-blue/80">{dimension.description}</p>

          <div className="mt-8 flex flex-col gap-6">
            {dimension.questions.map((q) => (
              <Card key={q.id} as="section">
                <CardBody className="flex flex-col gap-4 sm:p-8">
                  <div>
                    <p className="text-label text-code-blue/70">
                      Pergunta {questionNumber[q.id]} de {allQuestions.length}
                    </p>
                    <h2 id={`${q.id}-texto`} className="mt-2 text-lg font-semibold leading-snug tracking-normal">
                      {q.text}
                    </h2>
                  </div>
                  <div role="radiogroup" aria-labelledby={`${q.id}-texto`} className="flex flex-col gap-3">
                    {q.options.map((o) => (
                      <OptionCard
                        key={o.key}
                        name={q.id}
                        value={o.key}
                        checked={answers[q.id] === o.key}
                        onChange={() => onAnswersChange({ ...answers, [q.id]: o.key })}
                      >
                        {o.label}
                      </OptionCard>
                    ))}
                    {q.allowsNotSure && (
                      <OptionCard
                        name={q.id}
                        value={notSure.key}
                        checked={answers[q.id] === notSure.key}
                        onChange={() => onAnswersChange({ ...answers, [q.id]: notSure.key })}
                      >
                        {notSure.label}
                      </OptionCard>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mt-8 text-label text-code-blue/70">Antes das perguntas</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Seu perfil</h1>
          <p className="mt-3 text-code-blue/80">
            Estas informações ajudam a contextualizar o diagnóstico e não entram na pontuação.
          </p>

          <Card className="mt-8">
            <CardBody className="flex flex-col gap-6 sm:p-8">
              <Input
                label={profile.find((p) => p.id === 'P0b').text}
                placeholder="Ex.: Analista financeiro"
                maxLength={120}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <fieldset className="flex flex-col gap-3">
                <legend className="text-label text-code-blue">{profile.find((p) => p.id === 'P0c').text}</legend>
                <p className="text-sm text-code-blue/70">Marque todas as que se aplicam.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {profile.find((p) => p.id === 'P0c').options.map((tool) => (
                    <OptionCard
                      key={tool}
                      type="checkbox"
                      name="tools"
                      value={tool}
                      checked={tools.includes(tool)}
                      onChange={(e) => toggleTool(tool, e.target.checked)}
                    >
                      {tool}
                    </OptionCard>
                  ))}
                </div>
              </fieldset>
            </CardBody>
          </Card>
        </>
      )}

      {confirmBlank && (
        <Alert variant="warning" title={`Você deixou ${blankCount} ${blankCount === 1 ? 'pergunta' : 'perguntas'} em branco`} className="mt-8">
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

      {error && <Alert variant="error" className="mt-8">{error}</Alert>}

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="secondary"
          size="lg"
          disabled={busy}
          onClick={() => (stepIndex === 0 ? onBackToIdentify() : goTo(stepIndex - 1))}
        >
          Voltar
        </Button>
        <Button variant={isLast ? 'accent' : 'primary'} size="lg" disabled={busy || confirmBlank} onClick={handleNext}>
          {busy ? 'Enviando…' : isLast ? 'Enviar respostas' : 'Próxima etapa'}
        </Button>
      </div>
    </ParticipantShell>
  );
}
