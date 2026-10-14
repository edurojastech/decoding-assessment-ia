import { Alert, Badge } from '../ui/index.js';
import { cx } from '../ui/cx.js';
import { LevelBadge } from './LevelBadge.jsx';
import { LevelScale } from './LevelScale.jsx';
import { RadarChart } from './RadarChart.jsx';
import { ScoreGauge } from './ScoreGauge.jsx';

// RF-11: blocos 1 a 6 da devolutiva (seção 6 do original), na ordem do original.
// O texto vem pronto do backend (services/reportIndividual.js); aqui só se apresenta.
// Usado na tela e na versão do PDF: o layout responde ao contêiner (@container), não à janela,
// e cada `data-pdf-block` é uma unidade que não se quebra entre páginas (lib/pdf.js).
// Redesign: só o hero e a recomendação ficam em bloco escuro; o resto vive direto no fundo claro,
// separado por espaço e linhas finas. Cada evidência (RN-10) aparece uma única vez.

function SectionTitle({ eyebrow, id, children }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-label text-code-blue/70">{eyebrow}</p>
      <h2 id={id} className="text-2xl leading-tight">{children}</h2>
    </div>
  );
}

function Score({ value, size = 'md' }) {
  return (
    <span className="whitespace-nowrap">
      <span className={cx('font-bold', size === 'lg' ? 'text-2xl' : 'text-base')}>{value}</span>
      <span className="text-sm text-code-blue/70"> de 100</span>
    </span>
  );
}

// Barra decorativa: o número ao lado já informa o score.
function ScoreBar({ value }) {
  return (
    <div aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-code-blue-100">
      <div className="h-full rounded-full bg-insight-lime" style={{ width: `${value}%` }} />
    </div>
  );
}

// RN-10: evidência citada a partir da resposta da pessoa.
function Evidence({ evidence, className }) {
  if (!evidence) return null;
  return <p className={cx('border-l-2 border-insight pl-3 text-sm text-code-blue/80', className)}>{evidence.text}</p>;
}

// Bloco 1 · Estágio atual — hero escuro com nota, nível e régua de níveis.
function StageBlock({ stage, consistencyFlagged, heading, details }) {
  const calculated = stage.status === 'calculado';
  const [lead, ...rest] = stage.summary;
  return (
    <section
      aria-labelledby="bloco-estagio"
      data-pdf-block
      data-pdf-dark
      className="grid gap-8 overflow-hidden rounded-3xl bg-mesh-dark p-6 text-canvas sm:p-10 @3xl:grid-cols-[1.3fr_auto_1fr] @3xl:items-center"
    >
      <div className="flex flex-col gap-3">
        <p className="text-label text-insight">Estágio atual</p>
        <h2 id="bloco-estagio" className="text-3xl leading-tight @xl:text-4xl">
          {heading ?? (calculated ? stage.level : 'Preenchimento incompleto')}
        </h2>
        {details && <p className="text-canvas/80">{details}</p>}
      </div>

      <div className="flex justify-center">
        {calculated ? (
          <ScoreGauge score={stage.score}>
            <span className="text-5xl leading-none font-bold">{stage.score}</span>
            <span className="text-sm text-canvas/70">de 100</span>
            <LevelBadge level={stage.level} className="mt-1" />
          </ScoreGauge>
        ) : (
          <Badge variant="pending">Estágio geral não calculado</Badge>
        )}
      </div>

      <div className="flex flex-col gap-5 @3xl:border-l @3xl:border-canvas/15 @3xl:pl-8">
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold">{lead}</p>
          {rest.map((sentence) => <p key={sentence} className="text-sm text-canvas/80">{sentence}</p>)}
          {consistencyFlagged && (
            <p className="text-sm text-canvas/80">O estágio considera a observação de consistência, no fim desta devolutiva.</p>
          )}
        </div>
        {calculated && <LevelScale level={stage.level} />}
      </div>
    </section>
  );
}

function DimensionRow({ dimension: d }) {
  const scored = d.score !== null;
  return (
    <li className="flex flex-col gap-2 border-b border-code-blue-100 py-5 first:pt-0 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">{d.name}</h3>
        <div className="flex items-center gap-3">
          {scored ? <Score value={d.score} size="lg" /> : null}
          {scored ? <LevelBadge level={d.level} /> : <Badge variant="pending">Dados insuficientes</Badge>}
        </div>
      </div>
      {scored && <ScoreBar value={d.score} />}
      <p className="text-code-blue/90">{d.phrase}</p>
      <Evidence evidence={d.evidence} />
    </li>
  );
}

// Bloco 2 · Mapa por dimensão: radar ao lado das cinco dimensões (ordenadas da maior para a menor nota).
function DimensionMapBlock({ dimensions }) {
  const ranked = [...dimensions].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  return (
    <section aria-labelledby="bloco-mapa" className="grid gap-10 @3xl:grid-cols-[1fr_1.15fr] @3xl:gap-16">
      <div data-pdf-block className="flex flex-col gap-6">
        <SectionTitle eyebrow="Mapa por dimensão" id="bloco-mapa">Suas cinco dimensões</SectionTitle>
        <RadarChart data={dimensions.map(({ id, name, score }) => ({ id, name, score }))} />
        <p className="text-xs text-code-blue/70">
          Escala de 0 a 100. Os anéis marcam as faixas de nível: até 25 Iniciante, até 50 Básico,
          até 75 Intermediário e acima de 75 Avançado.
        </p>
      </div>
      <div data-pdf-block className="flex flex-col gap-6 @3xl:border-l @3xl:border-code-blue-100 @3xl:pl-16">
        <SectionTitle eyebrow="Resultado por dimensão" id="bloco-pontuacoes">Suas pontuações</SectionTitle>
        <ul aria-labelledby="bloco-pontuacoes" className="flex flex-col">
          {ranked.map((d) => <DimensionRow key={d.id} dimension={d} />)}
        </ul>
      </div>
    </section>
  );
}

function HighlightList({ items, tone, empty, shownEvidence }) {
  if (items.length === 0) return <p className="text-code-blue/80">{empty}</p>;
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li key={item.id} className="flex gap-4 border-b border-code-blue-100 py-5 first:pt-0 last:border-b-0">
          <span
            aria-hidden="true"
            className={cx('mt-2 h-3 w-3 shrink-0 rounded-full', tone === 'forca' ? 'bg-pulse-lime ring-4 ring-lime-100' : 'bg-insight ring-4 ring-insight-100')}
          />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <Score value={item.score} />
            </div>
            <p>{item.phrase}</p>
            {item.example && <p className="text-sm text-code-blue/80">{item.example}</p>}
            {item.evidence && !shownEvidence.has(item.evidence.text) && (
              <Evidence evidence={item.evidence} className={tone === 'forca' ? 'border-lime-900' : undefined} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// Blocos 3 e 4 · Potencialidades e lacunas, lado a lado.
function StrengthsAndGaps({ strengths, gaps, shownEvidence }) {
  return (
    <div className="grid gap-10 border-t border-code-blue-100 pt-10 @3xl:grid-cols-2 @3xl:gap-16">
      <section aria-labelledby="bloco-forcas" data-pdf-block className="flex flex-col gap-6">
        <SectionTitle eyebrow="Potencialidades" id="bloco-forcas">Onde você já se apoia</SectionTitle>
        <HighlightList
          items={strengths}
          tone="forca"
          shownEvidence={shownEvidence}
          empty="Ainda não há dimensões suficientes para apontar potencialidades."
        />
      </section>
      <section
        aria-labelledby="bloco-lacunas"
        data-pdf-block
        className="flex flex-col gap-6 @3xl:border-l @3xl:border-code-blue-100 @3xl:pl-16"
      >
        <SectionTitle eyebrow="Lacunas e o que significam" id="bloco-lacunas">Onde há mais espaço para avançar</SectionTitle>
        <HighlightList
          items={gaps}
          tone="lacuna"
          shownEvidence={shownEvidence}
          empty="Ainda não há dimensões suficientes para apontar lacunas."
        />
      </section>
    </div>
  );
}

// Bloco 5 · Próximos passos: três ações ligadas às lacunas, foco curto e o percurso como convite (RN-11).
function NextStepsBlock({ nextSteps }) {
  const { actions, focus, recommendation } = nextSteps;
  return (
    <section
      aria-labelledby="bloco-passos"
      data-pdf-block
      className="grid gap-10 border-t border-code-blue-100 pt-10 @3xl:grid-cols-[1.5fr_1fr] @3xl:gap-16"
    >
      <div className="flex flex-col gap-6">
        <SectionTitle eyebrow="Próximos passos" id="bloco-passos">O que fazer a partir de agora</SectionTitle>

        {actions.length > 0 && (
          <ol className="flex flex-col">
            {actions.map((a, i) => (
              <li key={a.text} className="flex items-baseline gap-5 border-b border-code-blue-100 py-4 first:pt-0 last:border-b-0">
                <span aria-hidden="true" className="w-6 shrink-0 text-3xl leading-none font-light text-code-blue-300">{i + 1}</span>
                <p className="text-lg">{a.text}</p>
              </li>
            ))}
          </ol>
        )}

        {focus.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-label text-code-blue/70">Foco curto</p>
            <dl className="grid gap-x-6 gap-y-2 @xl:grid-cols-[auto_1fr]">
              {focus.map((f) => (
                <div key={f.dimension} className="contents">
                  <dt className="text-sm font-semibold">{f.name}</dt>
                  <dd className="text-sm text-code-blue/80">{f.text.charAt(0).toUpperCase() + f.text.slice(1)}.</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <p className="text-xs text-code-blue/70">
          As ações e os exemplos são ilustrativos e servem para orientar o seu desenvolvimento.
        </p>
      </div>

      {recommendation && (
        <div data-pdf-dark className="flex flex-col gap-3 self-start rounded-3xl bg-mesh-dark p-8 text-canvas">
          <p className="text-label text-pulse-lime">Percurso sugerido · Trilha de IA</p>
          <p className="text-2xl leading-tight font-bold">{recommendation.offer}</p>
          <p className="text-canvas/85">{recommendation.invite}</p>
        </div>
      )}
    </section>
  );
}

// Bloco 6 · Observação de consistência (RN-09), em tom de desenvolvimento.
function ConsistencyBlock({ consistency }) {
  return (
    <section aria-label="Observação de consistência" data-pdf-block className="border-t border-code-blue-100 pt-10">
      <Alert variant="info" title={consistency.title}>
        <p>{consistency.text}</p>
      </Alert>
    </section>
  );
}

/**
 * `heading` e `details` (opcionais) personalizam o hero na tela: nome e identificação do participante.
 * Sem eles (PDF, que já tem cabeçalho próprio), o hero mostra o nível.
 */
export function ReportContent({ report, heading, details }) {
  const shownEvidence = new Set(report.dimensions.map((d) => d.evidence?.text).filter(Boolean));
  return (
    <div className="@container flex flex-col gap-12">
      <StageBlock stage={report.stage} consistencyFlagged={Boolean(report.consistency)} heading={heading} details={details} />
      <DimensionMapBlock dimensions={report.dimensions} />
      <StrengthsAndGaps strengths={report.strengths} gaps={report.gaps} shownEvidence={shownEvidence} />
      <NextStepsBlock nextSteps={report.nextSteps} />
      {report.consistency && <ConsistencyBlock consistency={report.consistency} />}
    </div>
  );
}
