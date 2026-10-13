import { NavLink } from 'react-router';
import { MoreHorizontal, X } from 'lucide-react';
import { Logo } from '../Logo.jsx';
import { Avatar } from '../ui/index.js';
import { cx } from '../ui/cx.js';
import { WorkspaceSwitcher } from './WorkspaceSwitcher.jsx';
import { UserMenu, displayName } from './UserMenu.jsx';
import { COMPANY_PAGES, OVERVIEW_PAGE, companyPath } from './nav.js';

const ITEM = 'relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors duration-150';
const NO_COMPANY = 'Selecione uma empresa no espaço de trabalho';

function NavItem({ to, end, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cx(
        ITEM,
        isActive ? 'bg-canvas/8 text-pulse-lime' : 'text-canvas/80 hover:bg-canvas/5 hover:text-canvas',
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && <span aria-hidden="true" className="absolute inset-y-2 -left-4 w-1 rounded-r-full bg-pulse-lime" />}
          <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
          {label}
        </>
      )}
    </NavLink>
  );
}

// Sem empresa selecionada, os itens da empresa ficam visíveis, mas desabilitados (com dica).
function DisabledItem({ icon: Icon, label }) {
  return (
    <span aria-disabled="true" title={NO_COMPANY} className={cx(ITEM, 'cursor-not-allowed text-canvas/40')}>
      <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
      {label}
      <span className="sr-only"> ({NO_COMPANY.toLowerCase()})</span>
    </span>
  );
}

// Sidebar navy do Decoding Campus (specs/07). < 1024px vira drawer (`open` controla).
export function Sidebar({ companies, selected, user, onLogout, open, onClose }) {
  return (
    <aside
      id="admin-sidebar"
      aria-label="Menu do admin"
      className={cx(
        'fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-code-blue text-canvas',
        'transition-[transform,visibility] duration-[250ms] ease-out lg:translate-x-0',
        !open && 'max-lg:invisible max-lg:-translate-x-full',
      )}
    >
      <div className="flex items-start justify-between px-6 pt-6 pb-8">
        <div>
          <Logo tone="onDark" className="h-8" />
          <p className="text-label mt-2 text-[10px] text-canvas/70">Campus</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1 text-canvas/80 hover:text-canvas lg:hidden">
          <X aria-hidden="true" className="h-5 w-5" />
          <span className="sr-only">Fechar menu</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          <p className="text-label px-2 text-[10px] text-canvas/60">Espaço de trabalho</p>
          <WorkspaceSwitcher companies={companies} selected={selected} />
        </div>

        <nav aria-label="Principal" className="flex flex-col gap-3">
          <p className="text-label px-2 text-[10px] text-canvas/60">Administradora</p>
          <ul className="flex flex-col gap-1">
            <li><NavItem to="/admin" end icon={OVERVIEW_PAGE.icon} label={OVERVIEW_PAGE.label} /></li>
            {COMPANY_PAGES.map((page) => (
              <li key={page.label}>
                {selected
                  ? <NavItem to={companyPath(selected.id, page.path)} end={!page.path} icon={page.icon} label={page.label} />
                  : <DisabledItem icon={page.icon} label={page.label} />}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex items-center gap-3 border-t border-canvas/10 px-4 py-4">
        <Avatar name={displayName(user)} tone="lime" size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{displayName(user)}</p>
          <p className="truncate text-xs text-canvas/70">{user?.email}</p>
        </div>
        <UserMenu
          user={user}
          onLogout={onLogout}
          placement="top"
          label="Opções da conta"
          trigger={<MoreHorizontal aria-hidden="true" className="h-5 w-5 text-canvas/80 hover:text-canvas" />}
        />
      </div>
    </aside>
  );
}
