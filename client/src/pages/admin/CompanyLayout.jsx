import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useOutletContext, useParams } from 'react-router';
import { api } from '../../lib/api.js';
import { saveLastCompany } from '../../lib/lastCompany.js';
import { Alert } from '../../components/ui/index.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { COMPANY_PAGES, companyPath } from '../../components/layout/nav.js';
import Participants from './Participants.jsx';
import Import from './Import.jsx';
import Diagnosis from './Diagnosis.jsx';
import Groups from './Groups.jsx';
import Turmas from './Turmas.jsx';

// /admin/empresas/:id/* — carrega a empresa uma vez e entrega às telas pelo contexto do Outlet.
export default function CompanyLayout() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { refreshCompanies } = useOutletContext();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => api.get(`/companies/${id}`)
    .then((data) => { setCompany(data); setError(''); })
    .catch((err) => {
      setError(err.message);
      if (err.status === 404) saveLastCompany(null);
    }), [id]);

  useEffect(() => { setCompany(null); load(); }, [load]);

  // Mudou participante ou nome: atualiza a empresa e o seletor da sidebar.
  const reload = useCallback(() => { refreshCompanies(); return load(); }, [load, refreshCompanies]);
  const go = useCallback((page, search = '') => navigate(`${companyPath(id, page)}${search}`), [id, navigate]);

  if (error && !company) {
    return (
      <Alert variant="error" title="Não foi possível abrir a empresa">
        {error} <Link to="/admin" className="font-semibold underline underline-offset-4">Voltar para a visão geral</Link>
      </Alert>
    );
  }
  if (!company) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader eyebrow="Assessment de IA" title={state?.name ?? 'Empresa'} />
        <p role="status" className="text-sm text-code-blue/70">Carregando…</p>
      </div>
    );
  }
  return <Outlet context={{ company, setCompany, reload, go, refreshCompanies }} />;
}

export const useCompany = () => useOutletContext();

const SUBTITLES = {
  participantes: 'Status, nível e link pessoal de cada pessoa. Os links não são enviados automaticamente.',
  importar: 'Importe a lista do time em CSV. Só as linhas válidas entram; as outras voltam para correção.',
  diagnostico: 'Consolidado da empresa como visão dos respondentes, sempre com a cobertura.',
  grupos: 'Respondentes agrupados por nível de maturidade, para orientar as turmas.',
  turmas: 'Monte, renomeie e ajuste as turmas. Pessoas podem ser movidas a qualquer momento.',
};

function CompanyPage({ path, children }) {
  const { company } = useCompany();
  const page = COMPANY_PAGES.find((p) => p.path === path);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow={`${page.label} · Assessment de IA`} title={company.name} subtitle={SUBTITLES[path]} />
      {children}
    </div>
  );
}

// Telas existentes, agora como rotas dentro do shell (specs/07): mesmo conteúdo, cabeçalho padrão.
export function ParticipantsPage() {
  const { company, reload, go } = useCompany();
  // Participantes monta o próprio cabeçalho, porque as ações (copiar links, CSV) dependem da lista filtrada.
  const header = { eyebrow: 'Participantes · Assessment de IA', title: company.name, subtitle: SUBTITLES.participantes };
  return <Participants company={company} header={header} onChanged={reload} onImport={() => go('importar')} />;
}

export function ImportPage() {
  const { company, reload, go } = useCompany();
  return (
    <CompanyPage path="importar">
      <Import company={company} onImported={reload} onShowParticipants={() => go('participantes')} />
    </CompanyPage>
  );
}

export function DiagnosisPage() {
  const { company, go } = useCompany();
  return <CompanyPage path="diagnostico"><Diagnosis company={company} onNavigate={go} /></CompanyPage>;
}

export function GroupsPage() {
  const { company, go } = useCompany();
  return <CompanyPage path="grupos"><Groups company={company} onNavigate={go} /></CompanyPage>;
}

export function TurmasPage() {
  const { company } = useCompany();
  return <CompanyPage path="turmas"><Turmas company={company} /></CompanyPage>;
}
