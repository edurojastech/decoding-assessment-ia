import { Alert, Badge, Card, CardBody } from '../ui/index.js';
import { cx } from '../ui/cx.js';
import { LevelBadge } from './LevelBadge.jsx';
import { RadarChart } from './RadarChart.jsx';

// RF-11: blocos 1 a 6 da devolutiva (seção 6 do original), na ordem do original.
// O texto vem pronto do backend (services/reportIndividual.js); aqui só se apresenta.
// Usado na tela e na versão do PDF: o layout responde ao contêiner (@container), não à janela,
// e cada `data-pdf-block` é uma unidade que não se quebra entre páginas (lib/pdf.js).

function SectionTitle({ number, title, id, children }) {
  return (
    <div>
      <p className="text-label text-code-blue/70">{String(number).padStart(2, '0')} · {title}</p>
      <h2 id={id} className="mt-2 text-h3">{children}</h2>
    </div>
  );
}

function Score({ value }) {
  return (
    <span className="text-sm font-semibold whitespace-nowrap">
      {value}<span className="font-normal text-code-blue/70"> de 100</span>
    </span>
  );
}

// Barra decorativa: o número ao lado já informa o score.
function ScoreBar({ value }) {
  return (
    <div aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded-full bg-code-blue-100">
      <div className="h-full rounded-full bg-insight-lime" style={{ width: `${value}%` }} />
    </div>
  );
}

// RN-10: evidência citada a partir da resposta da pessoa.
function Evidence({ evidence, className }) {
  if (!evidence) return null;
  return (
    <p className={cx('border-l-2 border-insight pl-3 text-sm text-code-blue/80', className)}>
      {evidence.text}
    </p>
  );
}

// Bloco 1 · Estágio atual.
function StageBlock({ stage, consistencyFlagged }) {
  const calculated = stage.status === 'calculado';
  return (
    <Card as="section" variant="gradient" aria-labelledby="bloco-estagio" data-pdf-block>
      <CardBody className="flex flex-col gap-4">
        <SectionTitle number={1} title="Estágio atual" id="bloco-estagio">
          {calculated ? stage.level : 'Preenchimento incompleto'}
        </SectionTitle>
        <div className="flex flex-wrap items-center gap-3">
          {calculated ? (
            <>
              <LevelBadge level={stage.level} />
              <Score value={stage.score} />
            </>
          ) : (
            <Badge variant="pending">Estágio geral não calculado</Badge>
          )}
        </div>
        {stage.summary.map((sentence) => <p key={sentence}>{sentence}</p>)}
        {consistencyFlagged && (
          <p className="text-sm text-code-blue/80">O estágio considera a observação de consistência, no fim desta devolutiva.</p>
        )}
      </CardBody>
    </Card>
  );
}

function DimensionCard({ dimension: d }) {
  const scored = d.score !== null;
  return (
    <Card data-pdf-block>
      <CardBody className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{d.name}</h3>
            <p className="text-sm text-code-blue/70">{d.description}</p>
          </div>
          {scored ? <LevelBadge level={d.level} /> : <Badge variant="pending">Dados insuficientes</Badge>}
        </div>
        {scored && (
          <div className="flex items-center gap-3">
            <ScoreBar value={d.score} />
            <Score value={d.score} />
          </div>
        )}
        <p>{d.phrase}</p>
        <Evidence evidence={d.evidence} />
      </CardBody>
    </Card>
  );
}

// Bloco 2 · Mapa por dimensão: radar + nível, frase e evidência de cada dimensão.
function DimensionMapBlock({ dimensions }) {
  return (
    <section aria-labelledby="bloco-mapa" className="flex flex-col gap-4">
      <Card data-pdf-block>
        <CardBody className="flex flex-col gap-4">
          <SectionTitle number={2} title="Mapa por dimensão" id="bloco-mapa">Suas cinco dimensões</SectionTitle>
          <RadarChart data={dimensions.map(({ id, name, score }) => ({ id, name, score }))} />
          <p className="text-sm text-code-blue/70">
            Escala de 0 a 100. Os anéis marcam as faixas de nível: até 25 Iniciante, até 50 Básico,
            até 75 Intermediário e acima de 75 Avançado.
          </p>
        </CardBody>
      </Card>
      <div className="grid gap-4 @2xl:grid-cols-2">
        {dimensions.map((d) => <DimensionCard key={d.id} dimension={d} />)}
      </div>
    </section>
  );
}

function HighlightList({ items, tone, empty }) {
  if (items.length === 0) return <p className="text-code-blue/80">{empty}</p>;
  return (
    <div className="grid gap-4 @2xl:grid-cols-2">
      {items.map((item) => (
        <div key={item.id} className={cx('flex flex-col gap-3 rounded-lg p-4', tone === 'forca' ? 'bg-lime-50' : 'bg-insight-50')}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold">{item.name}</h3>
            <Score value={item.score} />
          </div>
          <p>{item.phrase}</p>
          {item.example && <p className="text-sm">{item.example}</p>}
          <Evidence evidence={item.evidence} className={tone === 'forca' ? 'border-lime-900' : undefined} />
        </div>
      ))}
    </div>
  );
}

// Bloco 3 · Potencialidades.
function StrengthsBlock({ strengths }) {
  return (
    <Card as="section" aria-labelledby="bloco-forcas" data-pdf-block>
      <CardBody className="flex flex-col gap-4">
        <SectionTitle number={3} title="Potencialidades" id="bloco-forcas">Onde você já se apoia</SectionTitle>
        <HighlightList items={strengths} tone="forca" empty="Ainda não há dimensões suficientes para apontar potencialidades." />
      </CardBody>
    </Card>
  );
}

// Bloco 4 · Lacunas e o que significam.
function GapsBlock({ gaps }) {
  return (
    <Card as="section" aria-labelledby="bloco-lacunas" data-pdf-block>
      <CardBody className="flex flex-col gap-4">
        <SectionTitle number={4} title="Lacunas e o que significam" id="bloco-lacunas">Onde há mais espaço para avançar</SectionTitle>
        <HighlightList items={gaps} tone="lacuna" empty="Ainda não há dimensões suficientes para apontar lacunas." />
      </CardBody>
    </Card>
  );
}

// Bloco 5 · Próximos passos: três ações ligadas às lacunas, foco curto e o percurso como convite (RN-11).
function NextStepsBlock({ nextSteps }) {
  const { actions, focus, recommendation } = nextSteps;
  return (
    <Card as="section" aria-labelledby="bloco-passos" data-pdf-block>
      <CardBody className="flex flex-col gap-6">
        <SectionTitle number={5} title="Próximos passos" id="bloco-passos">O que fazer a partir de agora</SectionTitle>

        {actions.length > 0 && (
          <ol className="flex flex-col gap-3">
            {actions.map((a, i) => (
              <li key={a.text} className="flex gap-3">
                <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-insight text-sm font-bold">
                  {i + 1}
                </span>
                <p className="pt-0.5">{a.text}</p>
              </li>
            ))}
          </ol>
        )}

        {focus.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-label text-code-blue/70">Foco curto</p>
            <ul className="flex flex-col gap-2">
              {focus.map((f) => (
                <li key={f.dimension} className="flex flex-wrap items-baseline gap-2">
                  <Badge variant="highlight">{f.name}</Badge>
                  <span>{f.text.charAt(0).toUpperCase() + f.text.slice(1)}.</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendation && (
          <div className="flex flex-col gap-2 rounded-lg bg-code-blue p-6 text-canvas">
            <p className="text-label text-pulse-lime">Percurso sugerido · Trilha de IA</p>
            <p className="text-xl font-bold">{recommendation.offer}</p>
            <p className="text-canvas/90">{recommendation.invite}</p>
          </div>
        )}

        <p className="text-sm text-code-blue/70">
          As ações e os exemplos são ilustrativos e servem para orientar o seu desenvolvimento.
        </p>
      </CardBody>
    </Card>
  );
}

// Bloco 6 · Observação de consistência (RN-09), em tom de desenvolvimento.
function ConsistencyBlock({ consistency }) {
  return (
    <section aria-label="Observação de consistência" data-pdf-block>
      <p className="mb-2 text-label text-code-blue/70">06 · Observação de consistência</p>
      <Alert variant="info" title={consistency.title}>
        <p>{consistency.text}</p>
      </Alert>
    </section>
  );
}

export function ReportContent({ report }) {
  return (
    <div className="@container flex flex-col gap-6">
      <StageBlock stage={report.stage} consistencyFlagged={Boolean(report.consistency)} />
      <DimensionMapBlock dimensions={report.dimensions} />
      <StrengthsBlock strengths={report.strengths} />
      <GapsBlock gaps={report.gaps} />
      <NextStepsBlock nextSteps={report.nextSteps} />
      {report.consistency && <ConsistencyBlock consistency={report.consistency} />}
    </div>
  );
}
