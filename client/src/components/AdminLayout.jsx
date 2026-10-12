import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../lib/auth.jsx';
import { Logo } from './Logo.jsx';
import { Footer } from './Footer.jsx';
import { Button } from './ui/index.js';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-mesh-dark text-canvas">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/admin" aria-label="Início do painel"><Logo tone="onDark" /></Link>
            <nav aria-label="Principal">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `text-label ${isActive ? 'text-pulse-lime' : 'text-canvas/80 hover:text-canvas'}`}
              >
                Empresas
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-canvas/80 sm:inline">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-canvas! hover:bg-canvas/10!"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
