import { Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './lib/auth.jsx';
import { RequireAdmin } from './components/RequireAdmin.jsx';
import { AdminLayout } from './components/AdminLayout.jsx';
import Login from './pages/admin/Login.jsx';
import Overview from './pages/admin/Overview.jsx';
import Company from './pages/admin/Company.jsx';
import Welcome from './pages/participant/Welcome.jsx';
import NotFound from './pages/NotFound.jsx';

// Rotas conforme specs/03-dados-e-api.md ("Rotas do front").
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/r/:token" element={<Welcome />} />

      <Route path="/admin" element={<AuthProvider />}>
        <Route path="login" element={<Login />} />
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="empresas/:id" element={<Company />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
