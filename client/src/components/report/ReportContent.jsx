import { IconCheck, IconChevronDown, IconInfoCircle } from '@tabler/icons-react';
import { Alert, Badge, Icon } from '../ui/index.js';
import { cx } from '../ui/cx.js';
import { LevelBadge } from './LevelBadge.jsx';
import { LevelScale } from './LevelScale.jsx';
import { ScoreGauge } from './ScoreGauge.jsx';

// RF-11 + guia "Front 1 · Devolutiva no app": a tela logo depois do formulário, para ler em ~2 minutos.
// Sequência: resultado (nota, nível e síntese) → cinco dimensões em linhas (descrição | barra na escala 0–100 | interpretação) →
// prioridades e força relativa → primeira ação e percurso → relatório completo → como interpretar.
// O texto vem pronto do backend (`report.screen`, services/reportScreen.js); aqui só se apresenta.
// O layout responde ao contêiner (@container), não à janela. Estilo editorial: seções direto no fundo,
// separadas por espaço e linha fina; só o hero e a Trilha de IA ficam em bloco.

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

// Bloco 2 · Seu resultado — hero escuro com nota, nível, régua de níveis e a síntese.
function StageBlock({ stage, synthesis, consistencyFlagged, heading, details }) {
  const calculated = stage.status === 'calculado';
  const [lead, ...rest] = synthesis;
  return (
    <section
      aria-labelledby="bloco-estagio"
      className="grid gap-8 overflow-hidden rounded-xl bg-mesh-dark p-6 text-canvas sm:p-10 @3xl:grid-cols-[1.3fr_auto_1fr] @3xl:items-center"
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
          <Badge variant="pending">Resultado geral não calculado</Badge>
        )}
      </div>

      <div className="flex flex-col gap-5 @3xl:border-l @3xl:border-canvas/15 @3xl:pl-8">
        <div className="flex flex-col gap-2">
          {calculated && <p className="sr-only">Resultado geral: {stage.score} de 100. Nível {stage.level}.</p>}
          <p className="text-lg font-semibold">{lead}</p>
          {rest.length > 0 && <p className="text-sm text-canvas/80">{rest.join(' ')}</p>}
          {consistencyFlagged && (
            <p className="text-sm text-canvas/80">O nível considera a observação de consistência, mais abaixo.</p>
          )}
        </div>
        {calculated && <LevelScale level={stage.level} />}
      </div>
    </section>
  );
}

const TICKS = [0, 25, 50, 75, 100];

// Barra numa escala comum de 0 a 100 (marcas a cada 25), igual para as cinco dimensões.
function ScaleBar({ value }) {
  return (
    <div aria-hidden="true" className="relative h-2.5 rounded-full bg-code-blue-50">
      {TICKS.slice(1, -1).map((t) => (
        <span key={t} className="absolute inset-y-0 w-px bg-code-blue-100" style={{ left: `${t}%` }} />
      ))}
      <div className="relative h-full rounded-full bg-code-blue" style={{ width: `${value}%` }} />
    </div>
  );
}

// Uma linha por dimensão: dimensão e descrição | barra, nota e nível | interpretação.
// No celular, empilha na mesma ordem.
function DimensionRow({ dimension: d, line, description }) {
  const scored = d.score !== null;
  return (
    <li className="grid gap-3 border-b border-code-blue-100 py-5 last:border-b-0 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.3fr)] @3xl:gap-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold">{d.name}</h3>
        {description && <p className="text-sm text-code-blue/70">{description}</p>}
      </div>
      <div className="flex flex-col gap-2 @3xl:pt-1">
        {scored ? <ScaleBar value={d.score} /> : null}
        <div className="flex items-center gap-3">
          {scored && <Score value={d.score} />}
          {scored ? <LevelBadge level={d.level} /> : <Badge variant="pending">Dados insuficientes</Badge>}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {line && <p className="text-code-blue/90">{line.short}</p>}
        {line?.evidence.length > 0 && (
          <Disclosure label={line.evidence.length > 1 ? 'Ver respostas' : 'Ver resposta'}>
            {line.evidence.map((text) => <Evidence key={text} evidence={{ text }} />)}
          </Disclosure>
        )}
      </div>
    </li>
  );
}

// Bloco 3 · Cinco dimensões em linhas, com uma escala comum de 0 a 100 (substitui o radar:
// barras alinhadas comparam melhor que o mapa).
function DimensionMapBlock({ dimensions, lines, descriptions }) {
  const lineOf = Object.fromEntries(lines.map((l) => [l.id, l]));
  const descOf = Object.fromEntries((descriptions ?? []).map((d) => [d.name, d.description]));
  return (
    <section aria-labelledby="bloco-pontuacoes" className="flex flex-col gap-6 border-t border-code-blue-100 pt-10">
      <SectionTitle eyebrow="Suas cinco dimensões" id="bloco-pontuacoes" subtitle="Nota de 0 a 100, nível e o que as suas respostas indicam em cada dimensão.">
        Resultado por dimensão
      </SectionTitle>
      <div aria-hidden="true" className="hidden text-xs text-code-blue/60 @3xl:grid @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.3fr)] @3xl:gap-8">
        <span className="text-label">Dimensão</span>
        <span className="relative h-4">
          {TICKS.map((t) => (
            <span key={t} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${t}%` }}>{t}</span>
          ))}
        </span>
        <span className="text-label">O que indica</span>
      </div>
      <ul className="flex flex-col">
        {dimensions.map((d) => (
          <DimensionRow key={d.id} dimension={d} line={lineOf[d.id]} description={descOf[d.name]} />
        ))}
      </ul>
      <p className="flex items-start gap-2 text-xs text-code-blue/70">
        <Icon icon={IconInfoCircle} size={16} />
        Faixas de nível: até 25 Iniciante, até 50 Básico, até 75 Intermediário e acima de 75 Avançado.
      </p>
    </section>
  );
}

// Bloco 4 · Prioridades: até duas prioridades e uma força relativa, num bloco só.
function PrioritiesBlock({ focus, strength }) {
  if (!focus && !strength) return null;
  return (
    <section
      aria-labelledby="bloco-prioridades"
      className={cx('grid gap-10 border-t border-code-blue-100 pt-10', strength && focus && '@3xl:grid-cols-[1.4fr_1fr] @3xl:gap-0')}
    >
      {focus && (
        <div className={cx('flex flex-col gap-6', strength && '@3xl:pr-12')}>
          <SectionTitle eyebrow="Prioridades" id="bloco-prioridades" subtitle={focus.title}>Seu foco agora</SectionTitle>
          <ul className="flex flex-col">
            {focus.items.map((item) => (
              <li key={item.id} className="flex gap-4 border-b border-code-blue-100 py-4 first:pt-0 last:border-b-0">
                <Dot tone="lacuna" />
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <Score value={item.score} />
                    <LevelBadge level={item.level} />
                  </div>
                  <p className="text-code-blue/80">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {strength && (
        <div className={cx('flex flex-col gap-6', focus && '@3xl:border-l @3xl:border-code-blue-100 @3xl:pl-12')}>
          <SectionTitle eyebrow="Força relativa" id={focus ? undefined : 'bloco-prioridades'}>Onde você já se apoia</SectionTitle>
          <div className="flex gap-4">
            <Dot tone="forca" />
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="text-xl font-bold">{strength.name}</h3>
                <Score value={strength.score} />
                <LevelBadge level={strength.level} />
              </div>
              <p className="text-code-blue/80">{strength.text}</p>
              <p className="text-xs text-code-blue/70">É a maior nota do seu perfil hoje, não uma competência consolidada.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Bloco 5 · Primeira ação (uma prática com entrega verificável) e o percurso sugerido com a justificativa.
function FirstActionBlock({ firstAction, learning }) {
  if (!firstAction && !learning.offer) return null;
  return (
    <section
      aria-labelledby="bloco-acao"
      className="grid gap-10 border-t border-code-blue-100 pt-10 @3xl:grid-cols-[1.4fr_1fr] @3xl:gap-12"
    >
      {firstAction && (
        <div className="flex flex-col gap-5">
          <SectionTitle eyebrow="Primeira ação" id="bloco-acao">Sua primeira ação</SectionTitle>
          <p className="text-lg">{firstAction.text}</p>
          <div className="flex gap-4 border-l-4 border-insight pl-4">
            <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pulse-lime text-code-blue">
              <Icon icon={IconCheck} size={14} stroke={3} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-label text-code-blue/70">Entrega esperada</p>
              <p className="font-semibold">{firstAction.delivery}</p>
            </div>
          </div>
          <p className="text-sm text-code-blue/70">{firstAction.note}</p>
        </div>
      )}

      {learning.offer && (
        <div className="flex flex-col gap-4 self-start rounded-xl bg-mesh-dark p-8 text-canvas">
          <p className="text-label text-pulse-lime">Percurso sugerido · Trilha de IA</p>
          <p className="text-3xl leading-tight font-bold">{learning.offer.name}</p>
          <p className="text-canvas/85">{learning.offer.why}</p>
          {learning.text && (
            <p className="border-t border-canvas/15 pt-4 text-sm text-canvas/80">
              <b className="text-canvas">Aprendizagem sugerida:</b> {learning.text}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// Bloco 6 · Observação de consistência (RN-09), em tom de desenvolvimento.
function ConsistencyBlock({ consistency }) {
  return (
    <section aria-label="Observação de consistência">
      <Alert variant="info" title={consistency.title}>
        <p>{consistency.text}</p>
      </Alert>
    </section>
  );
}

/**
 * Bloco 7 · Como interpretar: resumo metodológico expansível (escala, dimensões, data, versão e alcance).
 * Fica depois do botão do relatório completo (Result.jsx).
 */
export function MethodologyBlock({ methodology, submittedAt }) {
  const { versions } = methodology;
  const date = submittedAt ? new Date(submittedAt).toLocaleDateString('pt-BR') : null;
  return (
    <details className="group border-t border-code-blue-100 pt-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col gap-1">
          <span className="text-label text-code-blue/70">Metodologia</span>
          <span className="text-lg font-bold">Como interpretar seus resultados</span>
        </span>
        <Icon icon={IconChevronDown} size={20} className="shrink-0 transition-transform duration-150 group-open:rotate-180" />
      </summary>
      <div className="mt-5 grid gap-6 text-sm text-code-blue/90 @3xl:grid-cols-2 @3xl:gap-10">
        <div className="flex flex-col gap-3">
          <p>{methodology.scale}</p>
          <p>{methodology.overall}</p>
          <p>{methodology.origin}</p>
          <p>{methodology.scope}</p>
        </div>
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2">
            {methodology.dimensions.map((d) => (
              <li key={d.name}><b>{d.name}:</b> {d.description}</li>
            ))}
          </ul>
          <p className="text-code-blue/70">
            {[date && `Aplicação em ${date}`, `instrumento v${versions.instrument}`, `devolutiva v${versions.report}`].filter(Boolean).join(' · ')}.
            {' '}{methodology.pdf}
          </p>
          {versions.notice && <p className="text-code-blue/70">{versions.notice}</p>}
        </div>
      </div>
    </details>
  );
}

/**
 * `heading` e `details` personalizam o hero com o nome e a identificação do participante.
 */
export function ReportContent({ report, heading, details }) {
  const { screen } = report;
  return (
    <div className="@container flex flex-col gap-12">
      <StageBlock
        stage={report.stage}
        synthesis={screen.synthesis}
        consistencyFlagged={Boolean(report.consistency)}
        heading={heading}
        details={details}
      />
      <DimensionMapBlock dimensions={report.dimensions} lines={screen.dimensions} descriptions={screen.methodology?.dimensions} />
      <PrioritiesBlock focus={screen.focus} strength={screen.strength} />
      <FirstActionBlock firstAction={screen.firstAction} learning={screen.learning} />
      {report.consistency && <ConsistencyBlock consistency={report.consistency} />}
    </div>
  );
}
