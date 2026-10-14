import { IconCheck, IconChevronDown, IconInfoCircle } from '@tabler/icons-react';
import { Alert, Badge, Icon } from '../ui/index.js';
import { cx } from '../ui/cx.js';
import { LevelBadge } from './LevelBadge.jsx';
import { LevelScale } from './LevelScale.jsx';
import { RadarChart } from './RadarChart.jsx';
import { ScoreGauge } from './ScoreGauge.jsx';

// RF-11: blocos 1 a 6 da devolutiva (seção 6 do original), na ordem do original.
// O texto vem pronto do backend (services/reportIndividual.js); aqui só se apresenta.
// Usado na tela e na versão do PDF: o layout responde ao contêiner (@container), não à janela,
// e cada `data-pdf-block` é uma unidade que não se quebra entre páginas (lib/pdf.js).
// Redesign (mockups aprovados): só o hero e a Trilha de IA ficam em bloco escuro; o resto vive direto
// no fundo claro. Detalhes (frase e evidência, RN-10) abrem sob demanda; no PDF (`expanded`) já vêm abertos.

function SectionTitle({ eyebrow, id, subtitle, children }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-label text-code-blue/70">{eyebrow}</p>
      <h2 id={id} className="text-3xl leading-tight">{children}</h2>
      {subtitle && <p className="text-code-blue/70">{subtitle}</p>}
    </div>
  );
}

function Score({ value, size = 'md' }) {
  return (
    <span className="whitespace-nowrap">
      <span className={cx('font-bold', size === 'lg' ? 'text-3xl' : 'text-xl')}>{value}</span>
      <span className="text-sm text-code-blue/70"> de 100</span>
    </span>
  );
}

// Barra decorativa: o número ao lado já informa o score.
function ScoreBar({ value, className }) {
  return (
    <div aria-hidden="true" className={cx('h-2 overflow-hidden rounded-full bg-code-blue-100', className)}>
      <div className="h-full rounded-full bg-insight-lime" style={{ width: `${value}%` }} />
    </div>
  );
}

// RN-10: evidência citada a partir da resposta da pessoa.
function Evidence({ evidence, className }) {
  if (!evidence) return null;
  return <p className={cx('border-l-2 border-insight pl-3 text-sm text-code-blue/80', className)}>{evidence.text}</p>;
}

// Abre/fecha um detalhe; no PDF sai sempre aberto e sem o gatilho.
function Disclosure({ label, expanded, children }) {
  if (expanded) return <div className="flex flex-col gap-2">{children}</div>;
  return (
    <details className="group">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-semibold text-code-blue-700 underline underline-offset-4 [&::-webkit-details-marker]:hidden">
        {label}
        <Icon icon={IconChevronDown} size={16} className="transition-transform duration-150 group-open:rotate-180" />
      </summary>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </details>
  );
}

const Dot = ({ tone }) => (
  <span
    aria-hidden="true"
    className={cx('mt-2.5 h-4 w-4 shrink-0 rounded-full', tone === 'forca' ? 'bg-pulse-lime' : 'bg-insight')}
  />
);

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
        <p className="text-label text-insight">Assessment de maturidade em IA</p>
        <h2 id="bloco-estagio" className="text-4xl leading-[1.05] @xl:text-5xl">
          {heading ?? (calculated ? stage.level : 'Preenchimento incompleto')}
        </h2>
        {details && <p className="text-lg text-canvas/85">{details}</p>}
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

function DimensionRow({ dimension: d, expanded }) {
  const scored = d.score !== null;
  return (
    <li className="flex flex-col gap-2 border-b border-code-blue-100 py-4 first:pt-0 last:border-b-0">
      <div className="grid grid-cols-[minmax(7rem,1fr)_minmax(5rem,1.3fr)_auto] items-center gap-4">
        <h3 className="text-lg font-bold">{d.name}</h3>
        {scored ? <ScoreBar value={d.score} /> : <span />}
        <div className="flex items-center justify-end gap-3">
          {scored && <Score value={d.score} />}
          {scored ? <LevelBadge level={d.level} /> : <Badge variant="pending">Dados insuficientes</Badge>}
        </div>
      </div>
      <Disclosure label="Ver por quê" expanded={expanded}>
        <p className="text-code-blue/90">{d.phrase}</p>
        <Evidence evidence={d.evidence} />
      </Disclosure>
    </li>
  );
}

// Bloco 2 · Mapa por dimensão: radar ao lado das pontuações (da maior para a menor) e, abaixo,
// o ponto forte e a maior lacuna em destaque.
function DimensionMapBlock({ dimensions, stage, strengths, gaps, expanded }) {
  const ranked = [...dimensions].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const byId = Object.fromEntries(dimensions.map((d) => [d.id, d]));
  // Frase coerente com o destaque: a de potencialidade para o ponto forte, a de lacuna para a maior lacuna.
  const phraseOf = (id, list) => list.find((x) => x.id === id)?.phrase ?? byId[id]?.phrase;
  const highlights = [
    stage.strongest && { tone: 'forca', label: 'Ponto forte', ...stage.strongest },
    stage.weakest && stage.weakest.id !== stage.strongest?.id && { tone: 'lacuna', label: 'Maior lacuna', ...stage.weakest },
  ].filter(Boolean);

  return (
    <section aria-labelledby="bloco-mapa" className="flex flex-col gap-10">
      <div className="grid gap-10 @3xl:grid-cols-[1fr_1.2fr] @3xl:gap-0">
        <div data-pdf-block className="flex flex-col gap-6 @3xl:pr-12">
          <SectionTitle eyebrow="Suas cinco dimensões" id="bloco-mapa" subtitle="Como você se posiciona nas cinco dimensões da maturidade em IA.">
            Visão geral do seu perfil
          </SectionTitle>
          <RadarChart data={dimensions.map(({ id, name, score }) => ({ id, name, score }))} />
          <p className="flex items-start gap-2 text-xs text-code-blue/70">
            <Icon icon={IconInfoCircle} size={16} />
            Escala de 0 a 100. Os anéis marcam as faixas de nível: até 25 Iniciante, até 50 Básico,
            até 75 Intermediário e acima de 75 Avançado.
          </p>
        </div>
        <div data-pdf-block className="flex flex-col gap-6 @3xl:border-l @3xl:border-code-blue-100 @3xl:pl-12">
          <SectionTitle eyebrow="Resultado por dimensão" id="bloco-pontuacoes" subtitle="Seu desempenho em cada dimensão da maturidade em IA.">
            Suas pontuações
          </SectionTitle>
          <ul aria-labelledby="bloco-pontuacoes" className="flex flex-col">
            {ranked.map((d) => <DimensionRow key={d.id} dimension={d} expanded={expanded} />)}
          </ul>
        </div>
      </div>

      {highlights.length > 0 && (
        <div data-pdf-block className="grid gap-8 border-t border-code-blue-100 pt-8 @3xl:grid-cols-2 @3xl:gap-0">
          {highlights.map((h, i) => (
            <div key={h.label} className={cx('flex gap-4', i === 1 && '@3xl:border-l @3xl:border-code-blue-100 @3xl:pl-12')}>
              <Dot tone={h.tone} />
              <div className="flex flex-col gap-1">
                <p className="text-label text-code-blue/70">{h.label}</p>
                <p className="text-2xl font-bold">{h.name} <span className="ml-1">{h.score}</span></p>
                <p className="text-code-blue/80">{phraseOf(h.id, h.tone === 'forca' ? strengths : gaps)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function HighlightList({ items, tone, empty, shownEvidence, expanded }) {
  if (items.length === 0) return <p className="text-code-blue/80">{empty}</p>;
  return (
    <ul className="flex flex-col">
      {items.map((item) => {
        const evidence = item.evidence && !shownEvidence.has(item.evidence.text) ? item.evidence : null;
        return (
          <li key={item.id} className="flex gap-4 border-b border-code-blue-100 py-5 first:pt-0 last:border-b-0">
            <Dot tone={tone} />
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <Score value={item.score} />
              </div>
              <p className="text-code-blue/80">{item.phrase}</p>
              {(item.example || evidence) && (
                <Disclosure label="Ver exemplo" expanded={expanded}>
                  {item.example && <p className="text-sm">{item.example}</p>}
                  <Evidence evidence={evidence} className={tone === 'forca' ? 'border-lime-900' : undefined} />
                </Disclosure>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Blocos 3 e 4 · Potencialidades e lacunas, lado a lado.
function StrengthsAndGaps({ strengths, gaps, shownEvidence, expanded }) {
  return (
    <div className="grid gap-10 border-t border-code-blue-100 pt-10 @3xl:grid-cols-2 @3xl:gap-0">
      <section aria-labelledby="bloco-forcas" data-pdf-block className="flex flex-col gap-6 @3xl:pr-12">
        <SectionTitle eyebrow="Potencialidades" id="bloco-forcas">Onde você já se apoia</SectionTitle>
        <HighlightList
          items={strengths}
          tone="forca"
          shownEvidence={shownEvidence}
          expanded={expanded}
          empty="Ainda não há dimensões suficientes para apontar potencialidades."
        />
      </section>
      <section
        aria-labelledby="bloco-lacunas"
        data-pdf-block
        className="flex flex-col gap-6 @3xl:border-l @3xl:border-code-blue-100 @3xl:pl-12"
      >
        <SectionTitle eyebrow="Lacunas e o que significam" id="bloco-lacunas">Onde há mais espaço para avançar</SectionTitle>
        <HighlightList
          items={gaps}
          tone="lacuna"
          shownEvidence={shownEvidence}
          expanded={expanded}
          empty="Ainda não há dimensões suficientes para apontar lacunas."
        />
      </section>
    </div>
  );
}

// Bloco 5 · Próximos passos: três ações ligadas às lacunas e o percurso como convite (RN-11),
// com o foco curto (dimensões ≤ 40) como itens da trilha.
function NextStepsBlock({ nextSteps }) {
  const { actions, focus, recommendation } = nextSteps;
  return (
    <section
      aria-labelledby="bloco-passos"
      data-pdf-block
      className="grid gap-10 border-t border-code-blue-100 pt-10 @3xl:grid-cols-[1.4fr_1fr] @3xl:gap-12"
    >
      <div className="flex flex-col gap-6">
        <SectionTitle eyebrow="Próximos passos" id="bloco-passos" subtitle="Ações práticas para evoluir no uso de IA no seu dia a dia.">
          O que fazer a partir de agora
        </SectionTitle>

        {actions.length > 0 && (
          <ol className="flex flex-col">
            {actions.map((a, i) => (
              <li key={a.text} className="flex items-center gap-5 border-b border-code-blue-100 py-4 first:pt-0 last:border-b-0">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-insight-100 text-lg font-bold">
                  {i + 1}
                </span>
                <p className="text-lg">{a.text}</p>
              </li>
            ))}
          </ol>
        )}

        {!recommendation && focus.length > 0 && (
          <ul className="flex flex-col gap-2">
            {focus.map((f) => <li key={f.dimension}><b>{f.name}:</b> {f.text}.</li>)}
          </ul>
        )}
      </div>

      {recommendation && (
        <div data-pdf-dark className="flex flex-col gap-4 self-start rounded-3xl bg-mesh-dark p-8 text-canvas">
          <p className="text-label text-pulse-lime">Percurso sugerido · Trilha de IA</p>
          <p className="text-3xl leading-tight font-bold">{recommendation.offer}</p>
          <p className="text-canvas/85">{recommendation.invite}</p>
          {focus.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-label text-canvas/70">Foco curto</p>
              <ul className="flex flex-col gap-3">
                {focus.map((f) => (
                  <li key={f.dimension} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pulse-lime text-code-blue">
                      <Icon icon={IconCheck} size={14} stroke={3} />
                    </span>
                    <span><b>{f.name}:</b> {f.text}.</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Bloco 6 · Observação de consistência (RN-09), em tom de desenvolvimento.
function ConsistencyBlock({ consistency }) {
  return (
    <section aria-label="Observação de consistência" data-pdf-block>
      <Alert variant="info" title={consistency.title}>
        <p>{consistency.text}</p>
      </Alert>
    </section>
  );
}

/**
 * `heading` e `details` (opcionais) personalizam o hero na tela: nome e identificação do participante.
 * Sem eles (PDF, que já tem cabeçalho próprio), o hero mostra o nível. `expanded`: detalhes abertos (PDF).
 */
export function ReportContent({ report, heading, details, expanded = false }) {
  const shownEvidence = new Set(report.dimensions.map((d) => d.evidence?.text).filter(Boolean));
  return (
    <div className="@container flex flex-col gap-12">
      <StageBlock stage={report.stage} consistencyFlagged={Boolean(report.consistency)} heading={heading} details={details} />
      <DimensionMapBlock dimensions={report.dimensions} stage={report.stage} strengths={report.strengths} gaps={report.gaps} expanded={expanded} />
      <StrengthsAndGaps strengths={report.strengths} gaps={report.gaps} shownEvidence={shownEvidence} expanded={expanded} />
      <NextStepsBlock nextSteps={report.nextSteps} />
      {report.consistency && <ConsistencyBlock consistency={report.consistency} />}
      <p className="flex items-center gap-2 border-t border-code-blue-100 pt-6 text-xs text-code-blue/70">
        <Icon icon={IconInfoCircle} size={16} />
        As ações e os exemplos são ilustrativos e servem para orientar o seu desenvolvimento.
      </p>
    </div>
  );
}
