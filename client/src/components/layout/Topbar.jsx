import { useState } from 'react';
import { IconChevronDown, IconChevronRight, IconHelpCircle, IconMenu2 } from '@tabler/icons-react';
import { Icon } from '../ui/Icon.jsx';
import { Avatar } from '../ui/index.js';
import { UserMenu, displayName } from './UserMenu.jsx';
import { HelpDialog } from './HelpDialog.jsx';

// Topbar branca: breadcrumb, ajuda e conta. Sem sino: não há notificações reais para mostrar.
export function Topbar({ page, user, onLogout, onMenu, menuOpen }) {
  const [help, setHelp] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-code-blue-100 bg-canvas px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-expanded={menuOpen}
        aria-controls="admin-sidebar"
        className="-ml-1 rounded-full p-2 hover:bg-code-blue-50 lg:hidden"
      >
        <Icon icon={IconMenu2} className="h-5 w-5" />
        <span className="sr-only">Abrir menu</span>
      </button>

      <nav aria-label="Você está em" className="min-w-0 flex-1">
        <ol className="flex items-center gap-2 text-sm">
          <li className="hidden text-code-blue/60 md:block">Decoding Campus</li>
          <li aria-hidden="true" className="hidden text-code-blue/40 md:block"><Icon icon={IconChevronRight} className="h-4 w-4" /></li>
          <li className="hidden text-code-blue/60 sm:block">Assessment de IA</li>
          <li aria-hidden="true" className="hidden text-code-blue/40 sm:block"><Icon icon={IconChevronRight} className="h-4 w-4" /></li>
          <li aria-current="page" className="truncate font-bold">{page}</li>
        </ol>
      </nav>

      <button type="button" onClick={() => setHelp(true)} className="rounded-full p-2 hover:bg-code-blue-50">
        <Icon icon={IconHelpCircle} className="h-5 w-5" />
        <span className="sr-only">Ajuda: níveis e cobertura</span>
      </button>

      <UserMenu
        user={user}
        onLogout={onLogout}
        label="Conta"
        trigger={(
          <>
            <Avatar name={displayName(user)} tone="insight" size="sm" />
            <span className="hidden text-sm font-semibold md:inline">{displayName(user)}</span>
            <Icon icon={IconChevronDown} className="hidden h-4 w-4 md:block" />
          </>
        )}
      />

      {help && <HelpDialog onClose={() => setHelp(false)} />}
    </header>
  );
}
