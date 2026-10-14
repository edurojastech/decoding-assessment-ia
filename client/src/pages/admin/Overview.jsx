import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router';
import {
  IconArrowRight, IconBuilding, IconChartPie, IconCircleCheck, IconPlus, IconUsers,
} from '@tabler/icons-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { Alert, Badge, Button, Card, CardBody, Icon, Input, KpiCard, Progress } from '../../components/ui/index.js';
import { LevelBars } from '../../components/charts/LevelBars.jsx';
import { CompositionBar } from '../../components/charts/CompositionBar.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { companyPath } from '../../components/layout/nav.js';

// RF-02: cadastro da empresa. Depois de criar, segue para a importação dos participantes.
function NewCompanyForm({ onCancel, onCreated }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome da empresa.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const company = await api.post('/companies', { name });
      onCreated();
      navigate(companyPath(company.id, 'importar'), { state: { name: company.name } });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Input
            label="Nova empresa"
            placeholder="Nome da empresa"
            value={name}
            maxLength={160}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            error={error}
            className="flex-1"
          />
          <div className="flex gap-2 sm:mt-[26px]">
            <Button type="submit" disabled={saving} className="sm:h-11">
              {saving ? 'Cadastrando…' : 'Cadastrar empresa'}
            </Button>
            {onCancel && <Button variant="ghost" onClick={onCancel} className="sm:h-11">Cancelar</Button>}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

// Composição por nível no formato da barra empilhada.
const toComposition = (distribution) => ({
  ...Object.fromEntries(distribution.levels.map((l) => [l.level, l.count])),
  incomplete: distribution.incomplete,
});

// Macro: soma de todas as empresas, como visão dos respondentes.
function Totals({ totals }) {
  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li><KpiCard icon={IconBuilding} label="Empresas" value={totals.companies} caption="no assessment" className="h-full" /></li>
        <li><KpiCard icon={IconUsers} label="Convidados" value={totals.invited} caption="pessoas com link pessoal" className="h-full" /></li>
        <li><KpiCard icon={IconCircleCheck} label="Respondentes" value={totals.responded} caption="concluíram o questionário" className="h-full" /></li>
        <li>
          <KpiCard icon={IconChartPie} label="Cobertura geral" value={`${totals.coverage}%`} caption={`${totals.responded} de ${totals.invited} convidados`} className="h-full">
            <Progress value={totals.coverage} showValue={false} hideLabel size="sm" label="Cobertura geral" />
          </KpiCard>
        </li>
      </ul>
      <Card as="section" aria-labelledby="macro">
        <CardBody className="flex flex-col gap-5">
          <div>
            <p className="text-label text-code-blue-300">Distribuição por nível · {totals.label}</p>
            <h2 id="macro" className="mt-2 text-h3">Todas as empresas</h2>
          </div>
          {totals.distribution.classified > 0
            ? <LevelBars levels={totals.distribution.levels} total={totals.distribution.classified} />
            : <p className="text-sm text-code-blue/70">Ainda não há respondentes com nível calculado.</p>}
        </CardBody>
      </Card>
    </>
  );
}

function CompanyCard({ company }) {
  return (
    <Card className="h-full transition-shadow duration-150 hover:shadow-lg">
      <CardBody className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-lg font-bold break-words">{company.name}</h2>
          <Badge variant={company.invited === 0 ? 'default' : 'info'}>
            {company.invited === 0 ? 'Sem participantes' : company.responded > 0 ? 'Em andamento' : 'Sem respostas'}
          </Badge>
        </div>
        <p className="text-sm text-code-blue/80">
          {company.invited} convidados · {company.responded} respondentes · {company.turmas} {company.turmas === 1 ? 'turma' : 'turmas'}
        </p>
        <Progress label="Cobertura" value={company.coverage} />
        {company.responded > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-label text-code-blue/70">Níveis dos respondentes</p>
            <CompositionBar composition={toComposition(company.distribution)} />
          </div>
        )}
        <Link
          to={companyPath(company.id)}
          state={{ name: company.name }}
          className="mt-auto inline-flex items-center gap-1 self-start text-sm font-semibold hover:underline"
        >
          Abrir painel<span className="sr-only"> de {company.name}</span> <Icon icon={IconArrowRight} className="h-4 w-4" />
        </Link>
      </CardBody>
    </Card>
  );
}

// RF-17: visão geral de todas as empresas — macro (soma) e micro (cada empresa).
export default function Overview() {
  const { user } = useAuth();
  const { refreshCompanies } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/admin/overview').then(setData).catch((err) => setError(err.message));
  }, []);

  const companies = data?.companies;
  const firstName = user?.name?.split(' ')[0] || 'Administrador';

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Olá, ${firstName}`}
        subtitle="Acompanhe o preenchimento de cada empresa. Os resultados aparecem sempre como visão dos respondentes, junto com a cobertura."
        actions={!creating && companies?.length > 0 && (
          <Button variant="accent" size="sm" onClick={() => setCreating(true)}>
            <Icon icon={IconPlus} className="h-4 w-4" /> Nova empresa
          </Button>
        )}
      />

      {(creating || companies?.length === 0) && (
        <NewCompanyForm onCreated={refreshCompanies} onCancel={companies?.length > 0 ? () => setCreating(false) : undefined} />
      )}

      {error && <Alert variant="error" title="Não foi possível carregar as empresas">{error}</Alert>}

      {!data && !error && <p role="status" className="text-sm text-code-blue/70">Carregando…</p>}

      {companies?.length > 0 && <Totals totals={data.totals} />}

      {companies?.length === 0 && (
        <p className="text-code-blue/80">Nenhuma empresa cadastrada ainda. Cadastre a primeira acima.</p>
      )}

      {companies?.length > 0 && (
        <section aria-labelledby="empresas" className="flex flex-col gap-4">
          <p id="empresas" className="text-label text-code-blue-300">Empresas</p>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => <li key={company.id}><CompanyCard company={company} /></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
