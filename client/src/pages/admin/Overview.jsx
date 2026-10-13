import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../../lib/api.js';
import { Alert, Badge, Button, Card, CardBody, Input, Progress } from '../../components/ui/index.js';
import { LevelBars } from '../../components/charts/LevelBars.jsx';
import { CompositionBar } from '../../components/charts/CompositionBar.jsx';

// RF-02: cadastro da empresa. Depois de criar, segue para a importação dos participantes.
function NewCompanyForm() {
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
      navigate(`/admin/empresas/${company.id}?aba=importar`, { state: { name: company.name } });
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
            onChange={(e) => setName(e.target.value)}
            error={error}
            className="flex-1"
          />
          <Button type="submit" disabled={saving} className="sm:mt-[26px] sm:h-11">
            {saving ? 'Cadastrando…' : 'Cadastrar empresa'}
          </Button>
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

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-label text-code-blue/70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

// Macro: soma de todas as empresas, como visão dos respondentes.
function Totals({ totals }) {
  return (
    <Card as="section" variant="dark" aria-labelledby="macro">
      <CardBody className="flex flex-col gap-6">
        <div>
          <p className="text-label text-code-blue/70">{totals.label} · todas as empresas</p>
          <h2 id="macro" className="mt-2 text-2xl">Panorama geral</h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-6">
              <Stat label="Empresas" value={totals.companies} />
              <Stat label="Convidados" value={totals.invited} />
              <Stat label="Respondentes" value={totals.responded} />
            </div>
            <Progress label="Cobertura geral" value={totals.coverage} />
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-label text-code-blue/70">Distribuição por nível</h3>
            {totals.distribution.classified > 0
              ? <LevelBars levels={totals.distribution.levels} total={totals.distribution.classified} />
              : <p className="text-sm text-code-blue/70">Ainda não há respondentes com nível calculado.</p>}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// RF-17: visão geral de todas as empresas — macro (soma) e micro (cada empresa).
export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/overview').then(setData).catch((err) => setError(err.message));
  }, []);

  const companies = data?.companies;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-label text-code-blue/70">Visão geral</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Empresas</h1>
        <p className="mt-2 max-w-2xl text-code-blue/80">
          Acompanhe o preenchimento de cada empresa. Os resultados aparecem sempre como
          visão dos respondentes, junto com a cobertura.
        </p>
      </div>

      <NewCompanyForm />

      {error && <Alert variant="error" title="Não foi possível carregar as empresas">{error}</Alert>}

      {!data && !error && <p role="status" className="text-sm text-code-blue/70">Carregando…</p>}

      {companies?.length > 0 && <Totals totals={data.totals} />}

      {companies?.length === 0 && (
        <Card><CardBody><p>Nenhuma empresa cadastrada ainda. Cadastre a primeira acima.</p></CardBody></Card>
      )}

      {companies?.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <li key={company.id}>
              <Card variant="gradient" className="h-full transition-shadow duration-150 hover:shadow-lg">
                <CardBody className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 break-words text-xl">{company.name}</h2>
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
                    to={`/admin/empresas/${company.id}`}
                    state={{ name: company.name }}
                    className="mt-auto text-sm font-semibold text-code-blue underline decoration-insight decoration-2 underline-offset-4 hover:decoration-code-blue"
                  >
                    Abrir empresa
                    <span className="sr-only"> {company.name}</span> →
                  </Link>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
