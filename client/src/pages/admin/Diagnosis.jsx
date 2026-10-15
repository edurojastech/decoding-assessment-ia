import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Alert, Button, Card, CardBody, Progress, Select } from '../../components/ui/index.js';
import { ScoreBars } from '../../components/charts/ScoreBars.jsx';
import { LevelBadge } from '../../components/report/LevelBadge.jsx';
import { LevelBars } from '../../components/charts/LevelBars.jsx';
import { Heatmap } from '../../components/charts/Heatmap.jsx';

// RF-13 + RF-14: diagnóstico consolidado (seção 6, "Relatório da empresa"), nos 6 blocos do original.
// Sempre como visão dos respondentes, com a cobertura visível (regra 5). Texto e números vêm do servidor.

// Títulos sem numeração: o eyebrow diz o assunto, o h2 a leitura.
function SectionTitle({ title, id, children }) {
  return (
    <div>
      <p className="text-label text-code-blue/70">{title}</p>
      <h2 id={id} className="mt-2 text-h3">{children}</h2>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-label text-code-blue/70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

// Bloco 1 · Cobertura, sempre visível.
function CoverageBlock({ coverage, scope, onArea }) {
  return (
    <section aria-labelledby="bloco-cobertura" className="flex flex-col gap-6 relative min-w-0 border-t border-code-blue-100 pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle title="Cobertura" id="bloco-cobertura">
            {coverage.label}
          </SectionTitle>
          {scope.areas.length > 1 && (
            <Select label="Área" value={scope.area ?? ''} onChange={(e) => onArea(e.target.value)} className="w-full sm:w-60">
              <option value="">Todas as áreas</option>
              {scope.areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          )}
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Convidados" value={coverage.invited} />
          <Stat label="Respondentes" value={coverage.responded} />
          <Stat label="Em andamento" value={coverage.inProgress} />
          <Stat label="Pendentes" value={coverage.pending} />
        </div>
        <Progress label="Respondentes sobre convidados" value={coverage.coverage} size="lg" />
        <p className="text-sm text-code-blue/80">
          Tudo abaixo descreve só quem respondeu{scope.area ? `, na área ${scope.area}` : ''}. Não é uma nota da empresa.
        </p>
      </section>
  );
}

// Bloco 2 · Estágio atual: distribuição por nível e média por dimensão em barras (escala 0–100).
function StageBlock({ summary }) {
  const { distribution, stage, dimensions } = summary;
  return (
    <section aria-labelledby="bloco-estagio" className="flex flex-col gap-6 relative min-w-0 border-t border-code-blue-100 pt-8">
        <SectionTitle title="Estágio atual" id="bloco-estagio">Perfil dos respondentes</SectionTitle>
        <div className="flex flex-col gap-2">
          {stage.text.map((t) => <p key={t}>{t}</p>)}
        </div>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-4">
            <h3 className="text-label text-code-blue/70">Distribuição por nível</h3>
            <LevelBars levels={distribution.levels} total={distribution.classified} />
            {distribution.incomplete > 0 && (
              <p className="text-sm text-code-blue/70">
                {distribution.incomplete} com preenchimento incompleto, fora da distribuição.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-label text-code-blue/70">Média dos respondentes por dimensão (0 a 100)</h3>
            <ScoreBars data={dimensions.map((d) => ({ id: d.id, name: d.name, score: d.average }))} />
          </div>
        </div>
      </section>
  );
}

// Blocos 3 e 4 · Potencialidades e lacunas, com números.
function HighlightBlock({ title, id, block }) {
  return (
    <section aria-labelledby={id} className="flex h-full flex-col gap-4 relative min-w-0 border-t border-code-blue-100 pt-8">
        <SectionTitle title={title} id={id}>
          {block.dimension ? block.dimension.name : 'Sem dados suficientes'}
        </SectionTitle>
        {block.dimension && (
          <div className="flex flex-wrap items-center gap-3">
            <LevelBadge level={block.dimension.level} />
            <span className="text-sm font-semibold">
              {block.dimension.average}<span className="font-normal text-code-blue/70"> de 100 · média</span>
            </span>
          </div>
        )}
        {block.text.map((t) => <p key={t}>{t}</p>)}
      </section>
  );
}

// Bloco 6 · Próximos passos: turmas sugeridas por maturidade e o foco de cada uma (seção 7).
function NextStepsBlock({ nextSteps, coverage, onTurmas }) {
  return (
    <section aria-labelledby="bloco-proximos" className="flex flex-col gap-6 relative min-w-0 border-t border-code-blue-100 pt-8">
        <SectionTitle title="Próximos passos" id="bloco-proximos">Composição sugerida de turmas</SectionTitle>
        <ul className="grid gap-4 md:grid-cols-3">
          {nextSteps.groups.map((g) => (
            <li key={g.id} className="flex flex-col gap-3 rounded-lg border border-code-blue-100 p-4">
              <p className="text-label text-code-blue/70">{g.name}</p>
              <p className="text-2xl font-bold">
                {g.count} <span className="text-base font-normal">{g.count === 1 ? 'pessoa' : 'pessoas'}</span>
              </p>
              <p className="text-sm">Percurso sugerido: <strong>{g.offer}</strong></p>
              {g.focus.length > 0 && (
                <p className="text-sm text-code-blue/80">
                  Foco por dimensão: {g.focus.map((f) => `${f.name} (${f.average})`).join(' · ')}
                </p>
              )}
            </li>
          ))}
        </ul>
        <p className="text-sm text-code-blue/80">{nextSteps.note}</p>
        <Alert variant="info">
          Estes números são o perfil de {coverage.responded} de {coverage.invited} convidados ({coverage.coverage}% de cobertura).
          Use-os para orientar as turmas, não como nota definitiva da empresa.
        </Alert>
        <Button variant="accent" className="self-start" onClick={onTurmas}>Montar turmas</Button>
      </section>
  );
}

export default function Diagnosis({ company, onNavigate }) {
  const [area, setArea] = useState('');
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const qs = area ? `?area=${encodeURIComponent(area)}` : '';
    api.get(`/companies/${company.id}/summary${qs}`)
      .then((data) => { setSummary(data); setError(''); })
      .catch((err) => setError(err.message));
  }, [company.id, area]);

  if (error) return <Alert variant="error" title="Não foi possível carregar o diagnóstico">{error}</Alert>;
  if (!summary) return <p role="status" className="text-sm text-code-blue/70">Carregando…</p>;

  if (company.invited === 0) {
    return (
      <Card>
        <CardBody className="flex flex-col items-start gap-4">
          <h2 className="text-h3">Sem participantes ainda</h2>
          <p className="text-code-blue/80">O diagnóstico aparece quando houver pessoas importadas e respostas enviadas.</p>
          <Button variant="accent" onClick={() => onNavigate('importar')}>Importar participantes</Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CoverageBlock coverage={summary.coverage} scope={summary.scope} onArea={setArea} />

      {summary.empty ? (
        <Card>
          <CardBody className="flex flex-col items-start gap-3">
            <h2 className="text-h3">Ainda não há respostas</h2>
            <p className="text-code-blue/80">
              Quando as pessoas concluírem o questionário, o perfil dos respondentes aparece aqui. Confira os links na tela Participantes.
            </p>
            <Button variant="secondary" size="sm" onClick={() => onNavigate('participantes')}>Ver participantes</Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <StageBlock summary={summary} />
          <div className="grid gap-6 md:grid-cols-2 md:gap-10">
            <HighlightBlock title="Potencialidades" id="bloco-forcas" block={summary.strengths} />
            <HighlightBlock title="Lacunas" id="bloco-lacunas" block={summary.gaps} />
          </div>
          <section aria-labelledby="bloco-areas" className="flex flex-col gap-6 relative min-w-0 border-t border-code-blue-100 pt-8">
              <SectionTitle title="Necessidades por área" id="bloco-areas">Dimensão × área</SectionTitle>
              <p className="text-code-blue/80">Média dos respondentes de cada área, de 0 a 100. Comece pelas células marcadas como foco.</p>
              <Heatmap dimensions={summary.areas.dimensions} rows={summary.areas.rows} />
          </section>
          <NextStepsBlock nextSteps={summary.nextSteps} coverage={summary.coverage} onTurmas={() => onNavigate('turmas')} />
        </>
      )}
    </div>
  );
}
