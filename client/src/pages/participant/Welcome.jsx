import { useState } from 'react';
import { api } from '../../lib/api.js';
import { Logo } from '../../components/Logo.jsx';
import { Footer } from '../../components/Footer.jsx';
import { Alert, Badge, Button, Card, CardBody, OptionCard } from '../../components/ui/index.js';

// RF-08: boas-vindas, tempo estimado, aviso de privacidade (LGPD) e consentimento (seção 11 do original).
export default function Welcome({ token, participant, questionnaire, onConsented }) {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const firstName = participant.name.split(' ')[0];

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
      <section className="bg-mesh-dark px-4 pb-24 pt-10 text-canvas sm:px-6 sm:pb-32 sm:pt-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <Logo tone="onDark" />
          <div>
            <p className="text-label text-insight">Assessment de Maturidade em IA</p>
            <h1 className="mt-4 text-3xl leading-tight sm:text-5xl">Decodifique seu potencial em IA.</h1>
            <p className="mt-4 max-w-2xl text-base text-canvas/80 sm:text-lg">
              Olá, {firstName}. Este diagnóstico mostra como você usa IA no trabalho hoje e aponta
              próximos passos práticos para avançar. São situações do dia a dia, em cinco dimensões:
              familiaridade, contexto, aplicação, revisão e autonomia.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="highlight">{questionnaire.estimatedTime}</Badge>
              <Badge variant="info">24 perguntas</Badge>
            </div>
          </div>
          <p className="text-label text-pulse-lime">IA First. Human Driven.</p>
        </div>
      </section>

      <main className="mx-auto -mt-16 w-full max-w-3xl flex-1 px-4 pb-12 sm:-mt-20 sm:px-6">
        <Card variant="gradient">
          <CardBody className="flex flex-col gap-6 sm:p-8">
            <div>
              <p className="text-label text-code-blue/70">Antes de começar</p>
              <h2 className="mt-2 text-2xl">Privacidade e uso dos seus dados</h2>
            </div>

            <dl className="flex flex-col gap-4 text-base">
              <div>
                <dt className="font-semibold">Finalidade</dt>
                <dd className="mt-1 text-code-blue/80">
                  Diagnóstico de desenvolvimento, para orientar a aprendizagem em IA. Não é uma avaliação
                  de desempenho e não substitui uma avaliação formal.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Dados usados</dt>
                <dd className="mt-1 text-code-blue/80">
                  Nome, e-mail e área, informados pela {participant.companyName}, e as suas respostas.
                  Na próxima tela você confere esses dados e pode corrigi-los.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Como são usados</dt>
                <dd className="mt-1 text-code-blue/80">
                  As respostas geram a sua devolutiva individual e compõem o diagnóstico consolidado da
                  empresa, apresentado como visão dos respondentes. A equipe da Decoding usa os níveis de
                  maturidade para organizar turmas de formação.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Exclusão</dt>
                <dd className="mt-1 text-code-blue/80">
                  A Decoding pode excluir os seus dados a pedido.
                </dd>
              </div>
            </dl>

            <OptionCard
              type="checkbox"
              name="consent"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            >
              Li as informações acima e concordo com o uso dos meus dados para este diagnóstico.
            </OptionCard>

            {error && <Alert variant="error">{error}</Alert>}

            <Button
              variant="accent"
              size="lg"
              className="w-full sm:w-auto sm:self-start"
              disabled={!accepted || sending}
              onClick={handleStart}
            >
              {sending ? 'Registrando…' : 'Começar o diagnóstico'}
            </Button>
          </CardBody>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
