import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { api } from '../../lib/api.js';
import { ParticipantShell } from '../../components/ParticipantShell.jsx';
import { Alert } from '../../components/ui/index.js';
import Welcome from './Welcome.jsx';
import Identify from './Identify.jsx';
import Questionnaire from './Questionnaire.jsx';
import Result from './Result.jsx';

// /r/:token → Welcome → Identify ("Seu perfil": identificação + P0b/P0c) → Questionnaire → Result (RF-08 a RF-12).
// Concluído, o mesmo link abre direto a devolutiva.

// Rascunho só no navegador desta aba, para um recarregamento não apagar as respostas.
// Nada é enviado ao servidor antes do "Enviar respostas".
const draftKey = (token) => `decoding:respostas:${token}`;

function loadDraft(token) {
  try {
    return JSON.parse(sessionStorage.getItem(draftKey(token))) ?? {};
  } catch {
    return {};
  }
}

function saveDraft(token, answers) {
  try {
    sessionStorage.setItem(draftKey(token), JSON.stringify(answers));
  } catch {
    // Armazenamento indisponível (aba privada): segue só em memória.
  }
}

function clearDraft(token) {
  try {
    sessionStorage.removeItem(draftKey(token));
  } catch {
    // idem
  }
}

function initialStep(participant) {
  if (participant.status === 'concluido') return 'result';
  return participant.consented ? 'identify' : 'welcome';
}

export default function ParticipantFlow() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState(null);
  const [answers, setAnswers] = useState(() => loadDraft(token));
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    api.get(`/r/${token}`)
      .then((d) => {
        if (!active) return;
        setData(d);
        setStep(initialStep(d.participant));
      })
      .catch((err) => active && setLoadError(err.message));
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  function updateParticipant(participant) {
    setData((d) => ({ ...d, participant }));
  }

  function updateAnswers(next) {
    setAnswers(next);
    saveDraft(token, next);
  }

  function handleSubmitted() {
    clearDraft(token);
    setData((d) => ({ ...d, participant: { ...d.participant, status: 'concluido' } }));
    setJustSubmitted(true);
    setStep('result');
  }

  if (loadError) {
    return (
      <ParticipantShell>
        <h1 className="text-3xl">Não foi possível abrir o diagnóstico</h1>
        <Alert variant="error" className="mt-6">{loadError}</Alert>
      </ParticipantShell>
    );
  }

  if (!data) {
    return (
      <ParticipantShell>
        <p role="status" className="text-code-blue/70">Carregando seu diagnóstico…</p>
      </ParticipantShell>
    );
  }

  const { participant, questionnaire } = data;

  switch (step) {
    case 'welcome':
      return (
        <Welcome
          token={token}
          participant={participant}
          questionnaire={questionnaire}
          onConsented={(p) => { updateParticipant(p); setStep('identify'); }}
        />
      );
    case 'identify':
      return (
        <Identify
          token={token}
          participant={participant}
          questionnaire={questionnaire}
          onConfirmed={(p) => { updateParticipant(p); setStep('questionnaire'); }}
        />
      );
    case 'questionnaire':
      return (
        <Questionnaire
          token={token}
          participant={participant}
          questionnaire={questionnaire}
          answers={answers}
          onAnswersChange={updateAnswers}
          onBackToIdentify={() => setStep('identify')}
          onSubmitted={handleSubmitted}
        />
      );
    default:
      return <Result token={token} justSubmitted={justSubmitted} />;
  }
}
