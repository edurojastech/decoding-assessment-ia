import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import {
  IconAlertTriangle, IconArrowRight, IconChartPie, IconCircleCheck, IconCircleDashed, IconClock,
  IconHourglass, IconUserCircle, IconUserPlus,
} from '@tabler/icons-react';
import { api } from '../../lib/api.js';
import { copyText } from '../../lib/clipboard.js';
import { saveLastCompany } from '../../lib/lastCompany.js';
import {
  Alert, AttentionList, Button, Card, CardBody, HeroCard, Icon, Input, KpiCard, Progress,
} from '../../components/ui/index.js';
import { LevelBars } from '../../components/charts/LevelBars.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { COMPANY_PAGES, companyPath } from '../../components/layout/nav.js';
import { useCompany } from './CompanyLayout.jsx';

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function RenameForm({ company, onDone, onCancel }) {
  const [name, setName] = useState(company.name);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome da empresa.');
      return;
    }
    setSaving(true);
    try {
      const updated = await api.patch(`/companies/${company.id}`, { name });
      onDone(updated.name);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Input
            label="Nome da empresa"
            value={name}
            maxLength={160}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            error={error}
            className="flex-1"
          />
          <div className="flex gap-2 sm:mt-[26px]">
            <Button type="submit" disabled={saving} className="sm:h-11">{saving ? 'Salvando…' : 'Salvar'}</Button>
            <Button variant="ghost" onClick={onCancel} className="sm:h-11">Cancelar</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

// RF-18: exclusão da empresa com confirmação explícita (não dá para desfazer).
function DeleteConfirm({ company, onDeleted, onCancel }) {
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/companies/${company.id}`);
      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Alert variant="warning" title={`Excluir ${company.name}?`}>
      <p>
        Isso apaga a empresa, {plural(company.invited, 'participante', 'participantes')}, as
        respostas e as turmas. Os links pessoais deixam de funcionar. Não dá para desfazer.
      </p>
      {error && <p className="mt-2 font-semibold">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Excluindo…' : 'Excluir definitivamente'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={deleting}>Cancelar</Button>
      </div>
    </Alert>
  );
}

// Próximo passo do hero: texto contextual a partir do status real do preenchimento.
function nextStep(company, unassigned, to) {
  const { pendente, em_andamento: inProgress } = company.statusCounts;
  if (company.invited === 0) {
    return {
      title: 'Importar o time',
      text: 'Importe a lista de participantes para gerar os links pessoais.',
      to: to('importar'), cta: 'Importar participantes',
    };
  }
  if (pendente > 0) {
    return {
      title: 'Distribuir os links pendentes',
      text: `${plural(pendente, 'pessoa ainda não começou', 'pessoas ainda não começaram')}. Copie os links pendentes e envie pelo seu canal.`,
      to: to('participantes', '?status=pendente'), cta: 'Ver pendentes',
    };
  }
  if (inProgress > 0) {
    return {
      title: 'Lembrar quem começou',
      text: `${plural(inProgress, 'pessoa começou', 'pessoas começaram')} e ainda não ${inProgress === 1 ? 'concluiu' : 'concluíram'}.`,
      to: to('participantes', '?status=em_andamento'), cta: 'Ver em andamento',
    };
  }
  if (unassigned > 0) {
    return {
      title: 'Montar as turmas',
      text: `Todos responderam. ${plural(unassigned, 'respondente está', 'respondentes estão')} sem turma.`,
      to: to('turmas'), cta: 'Abrir turmas',
    };
  }
  return {
    title: 'Revisar as turmas',
    text: 'Todos responderam e estão em turmas. Confira a composição sugerida.',
    to: to('turmas'), cta: 'Abrir turmas',
  };
}

// Lista "Pede atenção": só itens que existem nos dados (regra de honestidade da UI).
function attentionItems(company, summary, unassigned, to) {
  const { pendente, em_andamento: inProgress } = company.statusCounts;
  const incomplete = summary?.distribution?.incomplete ?? 0;
  const items = [];
  if (pendente > 0) {
    items.push({
      id: 'pendentes', icon: IconHourglass, to: to('participantes', '?status=pendente'),
      title: `${plural(pendente, 'participante pendente', 'participantes pendentes')}`,
      text: 'Ainda não abriram o link. Copie os links e envie de novo.',
    });
  }
  if (inProgress > 0) {
    items.push({
      id: 'andamento', icon: IconClock, to: to('participantes', '?status=em_andamento'),
      title: `${plural(inProgress, 'questionário em andamento', 'questionários em andamento')}`,
      text: 'Começaram e ainda não concluíram.',
    });
  }
  if (incomplete > 0) {
    items.push({
      id: 'incompletos', icon: IconAlertTriangle, to: to('grupos'),
      title: `${plural(incomplete, 'resposta com dados insuficientes', 'respostas com dados insuficientes')}`,
      text: 'Responderam menos de 70% do questionário, então o nível não foi calculado.',
    });
  }
  if (unassigned > 0) {
    items.push({
      id: 'sem-turma', icon: IconUserPlus, to: to('turmas'),
      title: `${plural(unassigned, 'respondente sem turma', 'respondentes sem turma')}`,
      text: 'Concluíram o questionário e ainda não estão em nenhuma turma.',
    });
  }
  return items;
}

// Visão geral da empresa (specs/07): hero, KPIs por status, distribuição por nível e "Pede atenção".
export default function CompanyHome() {
  const { company, setCompany, refreshCompanies } = useCompany();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(null); // 'rename' | 'delete'
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/companies/${company.id}/summary`), api.get(`/companies/${company.id}/turmas`)])
      .then(([s, b]) => { setSummary(s); setBoard(b); setError(''); })
      .catch((err) => setError(err.message));
  }, [company.id, company.invited]);

  // Links antigos com ?aba= continuam abrindo a tela certa.
  const legacyTab = searchParams.get('aba');
  if (COMPANY_PAGES.some((p) => p.path && p.path === legacyTab)) {
    return <Navigate to={companyPath(company.id, legacyTab)} replace />;
  }

  const to = (page, search = '') => `${companyPath(company.id, page)}${search}`;
  const { concluido, em_andamento: inProgress, pendente } = company.statusCounts;
  const unassigned = board?.unassigned.length ?? 0;
  const loading = !summary && !error;
  const step = nextStep(company, unassigned, to);
  const items = attentionItems(company, summary, unassigned, to);

  // Copia nome, e-mail e link dos pendentes (formato de planilha). Nada é enviado pelo app.
  async function copyPending() {
    setNotice('');
    try {
      const pending = await api.get(`/companies/${company.id}/participants?status=pendente`);
      await copyText(['nome\temail\tlink', ...pending.map((p) => `${p.name}\t${p.email}\t${p.link}`)].join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      setNotice(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Painel da empresa · Assessment de IA"
        title={company.name}
        subtitle="Acompanhe o preenchimento e prepare as turmas. Os resultados são a visão dos respondentes."
        actions={!mode && (
          <>
            {pendente > 0 && (
              <Button variant="secondary" size="sm" onClick={copyPending}>
                {copied ? 'Links pendentes copiados' : 'Copiar links pendentes'}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setMode('rename')}>Renomear</Button>
            <Button variant="destructive" size="sm" onClick={() => setMode('delete')}>Excluir empresa</Button>
          </>
        )}
      />

      {notice && <Alert variant="error">{notice}</Alert>}
      {mode === 'rename' && (
        <RenameForm
          company={company}
          onCancel={() => setMode(null)}
          onDone={(name) => { setCompany((c) => ({ ...c, name })); refreshCompanies(); setMode(null); }}
        />
      )}
      {mode === 'delete' && (
        <DeleteConfirm
          company={company}
          onCancel={() => setMode(null)}
          onDeleted={() => { saveLastCompany(null); refreshCompanies(); navigate('/admin', { replace: true }); }}
        />
      )}

      <HeroCard
        eyebrow="Visão dos respondentes"
        title="Diagnóstico de maturidade em IA"
        meta={company.invited > 0
          ? <p><strong className="text-canvas">{company.responded} de {company.invited}</strong> responderam · {company.coverage}% de cobertura</p>
          : <p>Nenhum participante importado ainda.</p>}
        actions={(
          <Button as={Link} to={to('diagnostico')} variant="accent">
            Ver diagnóstico <Icon icon={IconArrowRight} className="h-4 w-4" />
          </Button>
        )}
        aside={{
          title: step.title,
          text: step.text,
          action: (
            <Link to={step.to} className="inline-flex items-center gap-1 self-start text-sm font-semibold text-pulse-lime hover:underline">
              {step.cta} <Icon icon={IconArrowRight} className="h-4 w-4" />
            </Link>
          ),
        }}
      />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li>
          <KpiCard icon={IconCircleCheck} label="Concluídos" value={concluido} caption="responderam o questionário" to={to('participantes', '?status=concluido')} className="h-full" />
        </li>
        <li>
          <KpiCard icon={IconClock} label="Em andamento" value={inProgress} caption="começaram e não concluíram" to={to('participantes', '?status=em_andamento')} className="h-full" />
        </li>
        <li>
          <KpiCard icon={IconCircleDashed} label="Pendentes" value={pendente} caption="ainda não abriram o link" to={to('participantes', '?status=pendente')} className="h-full" />
        </li>
        <li>
          <KpiCard icon={IconChartPie} label="Cobertura" value={`${company.coverage}%`} caption={`${company.responded} de ${company.invited} convidados`} to={to('participantes')} className="h-full">
            <Progress value={company.coverage} showValue={false} hideLabel size="sm" label="Cobertura" />
          </KpiCard>
        </li>
      </ul>

      {error && <Alert variant="error" title="Não foi possível carregar o resumo">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card as="section" aria-labelledby="distribuicao">
          <CardBody className="flex h-full flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-label text-code-blue-300">Distribuição por nível</p>
                <h2 id="distribuicao" className="mt-2 text-h3">
                  {summary ? plural(summary.distribution.classified, 'respondente com nível', 'respondentes com nível') : 'Respondentes por nível'}
                </h2>
              </div>
              <Link to={to('grupos')} className="inline-flex items-center gap-1 text-sm font-semibold hover:underline">
                Ver grupos <Icon icon={IconArrowRight} className="h-4 w-4" />
              </Link>
            </div>
            {loading && <p role="status" className="text-sm text-code-blue/70">Carregando…</p>}
            {summary && summary.distribution.classified > 0 && (
              <LevelBars levels={summary.distribution.levels} total={summary.distribution.classified} />
            )}
            {summary && summary.distribution.classified === 0 && (
              <p className="flex items-center gap-2 text-sm text-code-blue/70">
                <Icon icon={IconUserCircle} className="h-4 w-4" /> Ainda não há respondentes com nível calculado.
              </p>
            )}
            {summary?.distribution.incomplete > 0 && (
              <p className="text-sm text-code-blue/70">
                {plural(summary.distribution.incomplete, 'pessoa', 'pessoas')} com preenchimento incompleto, fora da distribuição.
              </p>
            )}
          </CardBody>
        </Card>

        <AttentionList items={items} loading={loading} />
      </div>
    </div>
  );
}
