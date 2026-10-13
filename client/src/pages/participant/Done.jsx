import { ParticipantShell } from '../../components/ParticipantShell.jsx';
import { Badge, Card, CardBody } from '../../components/ui/index.js';

// Conclusão do envio. A devolutiva individual (Result + PDF) substitui esta tela na Fatia B.
// Só afirma o que de fato aconteceu: as respostas foram gravadas (RNF-05).
export default function Done({ participant }) {
  const firstName = participant.name.split(' ')[0];
  return (
    <ParticipantShell>
      <Card variant="gradient">
        <CardBody className="flex flex-col gap-4 sm:p-8">
          <Badge variant="success" className="self-start">Concluído</Badge>
          <h1 className="text-3xl sm:text-4xl">Feito, {firstName}! Suas respostas foram registradas.</h1>
          <p className="text-code-blue/80">
            Obrigado por dedicar esse tempo ao diagnóstico. Você já pode fechar esta página.
          </p>
        </CardBody>
      </Card>
    </ParticipantShell>
  );
}
