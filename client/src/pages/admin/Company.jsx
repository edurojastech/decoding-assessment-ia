import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { api } from '../../lib/api.js';
import { Alert, Button, Card, CardBody, Input, Progress } from '../../components/ui/index.js';
import { cx } from '../../components/ui/cx.js';
import Participants from './Participants.jsx';
import Import from './Import.jsx';

// Abas de /admin/empresas/:id (specs/03-dados-e-api.md). Diagnóstico, Grupos e Turmas: Fatia D.
const TABS = [
  { id: 'participantes', label: 'Participantes' },
  { id: 'importar', label: 'Importar' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'grupos', label: 'Grupos' },
  { id: 'turmas', label: 'Turmas' },
];

function Kpi({ label, value }) {
  return (
    <div>
      <p className="text-label text-code-blue/70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

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
  );
}

// RF-18: exclusão da empresa com confirmação explícita (não dá para desfazer).
function DeleteConfirm({ company, onCancel }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/companies/${company.id}`);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Alert variant="warning" title={`Excluir ${company.name}?`}>
      <p>
        Isso apaga a empresa, {company.invited} {company.invited === 1 ? 'participante' : 'participantes'}, as
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

function ComingSoon({ children }) {
  return (
    <Card>
      <CardBody>
        <p className="text-code-blue/80">{children}</p>
      </CardBody>
    </Card>
  );
}

export default function Company() {
  const { id } = useParams();
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(null); // 'rename' | 'delete'

  const tab = TABS.some((t) => t.id === searchParams.get('aba')) ? searchParams.get('aba') : 'participantes';
  const selectTab = (next) => setSearchParams(next === 'participantes' ? {} : { aba: next });

  const load = useCallback(() => api.get(`/companies/${id}`)
    .then((data) => { setCompany(data); setError(''); })
    .catch((err) => setError(err.message)), [id]);

  useEffect(() => { load(); }, [load]);

  const title = company?.name ?? state?.name ?? 'Empresa';

  return (
    <div className="flex flex-col gap-8">
      <Link to="/admin" className="text-sm font-semibold text-code-blue/80 hover:text-code-blue">← Empresas</Link>

      {error && !company && <Alert variant="error" title="Não foi possível abrir a empresa">{error}</Alert>}

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-label text-code-blue/70">Empresa</p>
            <h1 className="mt-2 break-words text-3xl sm:text-4xl">{title}</h1>
          </div>
          {company && !mode && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setMode('rename')}>Renomear</Button>
              <Button variant="ghost" size="sm" onClick={() => setMode('delete')}>Excluir empresa</Button>
            </div>
          )}
        </div>

        {company && mode === 'rename' && (
          <RenameForm
            company={company}
            onCancel={() => setMode(null)}
            onDone={(name) => { setCompany((c) => ({ ...c, name })); setMode(null); }}
          />
        )}
        {company && mode === 'delete' && <DeleteConfirm company={company} onCancel={() => setMode(null)} />}

        {company && (
          <Card>
            <CardBody className="grid gap-6 sm:grid-cols-[auto_auto_1fr] sm:items-end sm:gap-10">
              <Kpi label="Convidados" value={company.invited} />
              <Kpi label="Respondentes" value={company.responded} />
              <Progress label="Cobertura" value={company.coverage} />
            </CardBody>
          </Card>
        )}
      </div>

      {company && (
        <div className="flex flex-col gap-6">
          <div role="tablist" aria-label="Seções da empresa" className="-mx-4 flex gap-1 overflow-x-auto border-b border-code-blue-100 px-4 sm:mx-0 sm:px-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => selectTab(t.id)}
                className={cx(
                  'text-label -mb-px shrink-0 border-b-2 px-4 py-3 transition-colors duration-150',
                  tab === t.id ? 'border-insight text-code-blue' : 'border-transparent text-code-blue/60 hover:text-code-blue',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'participantes' && (
              <Participants company={company} onChanged={load} onImport={() => selectTab('importar')} />
            )}
            {tab === 'importar' && (
              <Import company={company} onImported={load} onShowParticipants={() => selectTab('participantes')} />
            )}
            {tab === 'diagnostico' && (
              <ComingSoon>
                Em construção: o diagnóstico consolidado (visão dos respondentes, com cobertura) entra na próxima etapa.
              </ComingSoon>
            )}
            {tab === 'grupos' && <ComingSoon>Em construção: os grupos por maturidade entram na próxima etapa.</ComingSoon>}
            {tab === 'turmas' && <ComingSoon>Em construção: a montagem de turmas entra na próxima etapa.</ComingSoon>}
          </div>
        </div>
      )}
    </div>
  );
}
