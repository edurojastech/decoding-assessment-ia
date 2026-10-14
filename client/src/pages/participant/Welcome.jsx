import { useState } from 'react';
import {
  IconArrowRight, IconChartRadar, IconClock, IconDatabase, IconListNumbers, IconSettings, IconTarget, IconTrash,
} from '@tabler/icons-react';
import { api } from '../../lib/api.js';
import { Logo } from '../../components/Logo.jsx';
import { Footer } from '../../components/Footer.jsx';
import { Alert, Button, Icon, OptionCard } from '../../components/ui/index.js';

// RF-08: boas-vindas, tempo estimado, aviso de privacidade (LGPD) e consentimento (seção 11 do original).
// Redesign: hero e consentimento lado a lado, com o botão de início visível sem rolar (desktop).
// O aviso completo continua na página, em "Ler detalhes".

const PRIVACY = (companyName) => [
  {
    icon: IconTarget,
    title: 'Finalidade',
    short: 'Orientar o seu desenvolvimento em IA. Não é uma avaliação de desempenho.',
    full: 'Diagnóstico de desenvolvimento, para orientar a aprendizagem em IA. Não é uma avaliação de desempenho e não substitui uma avaliação formal.',
  },
  {
    icon: IconDatabase,
    title: 'Dados usados',
    short: `Nome, e-mail e área, informados pela ${companyName}, e as suas respostas.`,
    full: `Nome, e-mail e área, informados pela ${companyName}, e as suas respostas. Na próxima tela você confere esses dados e pode corrigi-los.`,
  },
  {
    icon: IconSettings,
    title: 'Como são usados',
    short: 'Geram a sua devolutiva individual e a visão consolidada da empresa.',
    full: 'As respostas geram a sua devolutiva individual e compõem o diagnóstico consolidado da empresa, apresentado como visão dos respondentes. A equipe da Decoding usa os níveis de maturidade para organizar turmas de formação.',
  },
  {
    icon: IconTrash,
    title: 'Exclusão',
    short: 'A Decoding pode excluir os seus dados a pedido.',
    full: 'A Decoding pode excluir os seus dados a pedido.',
  },
];

function Chip({ icon, tone, children }) {
  const tones = {
    lime: 'bg-pulse-lime text-code-blue',
    insight: 'bg-insight text-code-blue',
    light: 'bg-canvas/90 text-code-blue',
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.05em] uppercase ${tones[tone]}`}>
      <Icon icon={icon} size={16} />
      {children}
    </span>
  );
}

export default function Welcome({ token, participant, questionnaire, onConsented }) {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const firstName = participant.name.split(' ')[0];
  const dimensions = questionnaire.dimensions;
  const questionCount = dimensions.reduce((s, d) => s + d.questions.length, 0);
  const items = PRIVACY(participant.companyName);

  async function handleStart() {
    setError('');
    setSending(true);
    try {
      const { participant: updated } = await api.patch(`/r/${token}`, { consent: true });
      onConsented(updated);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="grid flex-1 lg:grid-cols-[1.05fr_1fr]">
        {/* Hero escuro (Degradê 01 · Mesh Escuro) */}
        <section className="flex flex-col justify-between gap-12 bg-mesh-dark px-6 py-10 text-canvas sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <Logo tone="onDark" />

          <div className="flex flex-col gap-6">
            <p className="text-label text-insight">Assessment de Maturidade em IA</p>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl xl:text-6xl">
              Decodifique seu potencial em <span className="text-pulse-lime">IA.</span>
            </h1>
            <div className="flex max-w-xl flex-col gap-2">
              <p className="text-2xl font-bold">Olá, {firstName}.</p>
              <p className="text-lg text-canvas/80">
                Este diagnóstico mostra como você usa IA no trabalho hoje e aponta próximos passos práticos
                para avançar, a partir de situações do dia a dia.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip icon={IconClock} tone="lime">{questionnaire.estimatedTime}</Chip>
              <Chip icon={IconListNumbers} tone="insight">{questionCount} perguntas</Chip>
              <Chip icon={IconChartRadar} tone="light">{dimensions.length} dimensões</Chip>
            </div>

            {/* As cinco dimensões em linha do tempo */}
            <ol aria-label="Dimensões avaliadas" className="mt-4 grid max-w-xl grid-cols-5 gap-2">
              {dimensions.map((d, i) => (
                <li key={d.id} className="relative flex flex-col items-center gap-2 text-center">
                  {i < dimensions.length - 1 && (
                    <span aria-hidden="true" className="absolute top-4 left-1/2 h-px w-full bg-insight/40" />
                  )}
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-insight/60 bg-code-blue text-sm font-semibold text-canvas">
                    {i + 1}
                  </span>
                  <span className="text-xs text-canvas/80 sm:text-sm">{d.name}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="text-label text-canvas/70">
            IA First. <span className="text-pulse-lime">Human Driven.</span>
          </p>
        </section>

        {/* Privacidade e consentimento, direto no fundo claro (sem card) */}
        <main className="flex items-center bg-surface px-6 py-12 sm:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-label text-code-blue/70">Antes de começar</p>
              <h2 className="text-3xl leading-tight">Privacidade e uso dos seus dados</h2>
            </div>

            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.title} className="flex gap-4 border-b border-code-blue-100 py-4 first:pt-0">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-insight-50 text-insight-700">
                    <Icon icon={item.icon} size={22} />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-code-blue/80">{item.short}</p>
                  </div>
                </li>
              ))}
            </ul>

            <details className="group -mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-code-blue-700 underline underline-offset-4">
                Ler detalhes
              </summary>
              <dl className="mt-4 flex flex-col gap-3 text-sm text-code-blue/80">
                {items.map((item) => (
                  <div key={item.title}>
                    <dt className="font-semibold text-code-blue">{item.title}</dt>
                    <dd>{item.full}</dd>
                  </div>
                ))}
              </dl>
            </details>

            <div className="flex flex-col gap-4 border-t border-code-blue-100 pt-6">
              <OptionCard
                type="checkbox"
                variant="plain"
                name="consent"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              >
                Li as informações e concordo com o uso dos meus dados para este diagnóstico.
              </OptionCard>

              {error && <Alert variant="error">{error}</Alert>}

              <Button variant="accent" size="lg" className="w-full" disabled={!accepted || sending} onClick={handleStart}>
                {sending ? 'Registrando…' : 'Começar o diagnóstico'}
                {!sending && <Icon icon={IconArrowRight} size={20} />}
              </Button>
              <p className="text-center text-xs text-code-blue/70">
                Diagnóstico de desenvolvimento, não uma avaliação de desempenho.
              </p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
