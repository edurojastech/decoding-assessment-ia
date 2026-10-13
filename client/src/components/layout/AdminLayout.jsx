import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useMatch, useNavigate } from 'react-router';
import { useAuth } from '../../lib/auth.jsx';
import { api } from '../../lib/api.js';
import { readLastCompany, saveLastCompany } from '../../lib/lastCompany.js';
import { Footer } from '../Footer.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { pageLabel } from './nav.js';

// Shell do admin no padrão Decoding Campus (specs/07-layout-dashboard.md).
// A empresa selecionada vem da URL; fora dela, da última aberta (localStorage, só conveniência).
export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const match = useMatch('/admin/empresas/:id/*');
  const routeId = match && /^\d+$/.test(match.params.id) ? Number(match.params.id) : null;

  const [companies, setCompanies] = useState([]);
  const [drawer, setDrawer] = useState(false);

  const refreshCompanies = useCallback(() => api.get('/companies')
    .then(setCompanies)
    .catch(() => {}), []);

  useEffect(() => { refreshCompanies(); }, [refreshCompanies]);
  useEffect(() => { if (routeId) saveLastCompany(routeId); }, [routeId]);
  useEffect(() => { setDrawer(false); }, [location.pathname, location.search]);
  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (event) => event.key === 'Escape' && setDrawer(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawer]);

  const selectedId = routeId ?? readLastCompany();
  const selected = companies.find((c) => c.id === selectedId) ?? null;

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="min-h-dvh bg-surface lg:pl-60">
      <Sidebar
        companies={companies}
        selected={selected}
        user={user}
        onLogout={handleLogout}
        open={drawer}
        onClose={() => setDrawer(false)}
      />
      {drawer && (
        <div aria-hidden="true" className="fixed inset-0 z-30 bg-code-blue/50 lg:hidden" onClick={() => setDrawer(false)} />
      )}

      <div className="flex min-h-dvh min-w-0 flex-col">
        <Topbar
          page={pageLabel(location.pathname)}
          user={user}
          onLogout={handleLogout}
          menuOpen={drawer}
          onMenu={() => setDrawer(true)}
        />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-8">
          <Outlet context={{ refreshCompanies }} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
