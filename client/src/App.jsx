import { Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './lib/auth.jsx';
import { RequireAdmin } from './components/RequireAdmin.jsx';
import { AdminLayout } from './components/layout/AdminLayout.jsx';
import Login from './pages/admin/Login.jsx';
import Overview from './pages/admin/Overview.jsx';
import CompanyLayout, {
  DiagnosisPage, GroupsPage, ImportPage, ParticipantsPage, TurmasPage,
} from './pages/admin/CompanyLayout.jsx';
import CompanyHome from './pages/admin/CompanyHome.jsx';
import ParticipantFlow from './pages/participant/ParticipantFlow.jsx';
import NotFound from './pages/NotFound.jsx';

// Rotas conforme specs/03-dados-e-api.md ("Rotas do front") e specs/07-layout-dashboard.md (shell do admin).
// O fluxo do participante fica fora do shell.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/r/:token" element={<ParticipantFlow />} />

      <Route path="/admin" element={<AuthProvider />}>
        <Route path="login" element={<Login />} />
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="empresas/:id" element={<CompanyLayout />}>
              <Route index element={<CompanyHome />} />
              <Route path="participantes" element={<ParticipantsPage />} />
              <Route path="importar" element={<ImportPage />} />
              <Route path="diagnostico" element={<DiagnosisPage />} />
              <Route path="grupos" element={<GroupsPage />} />
              <Route path="turmas" element={<TurmasPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
