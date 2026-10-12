import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../lib/auth.jsx';

export function RequireAdmin() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <p role="status" className="p-8 text-center text-sm text-code-blue/70">Carregando…</p>
    );
  }
  if (status === 'anonymous') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
