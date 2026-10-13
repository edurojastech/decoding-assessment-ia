import { useCallback, useId, useRef, useState } from 'react';
import { IconLogout } from '@tabler/icons-react';
import { Icon } from '../ui/Icon.jsx';
import { cx } from '../ui/cx.js';
import { useDismiss } from './useDismiss.js';

export const displayName = (user) => user?.name || 'Administrador Decoding';

// Menu com "Sair", aberto pelo avatar da topbar ou pelo "⋯" da sidebar.
export function UserMenu({ user, onLogout, trigger, label, placement = 'bottom' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full"
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          className={cx(
            'absolute right-0 z-50 w-60 overflow-hidden rounded-lg bg-canvas text-code-blue shadow-lg',
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          <div className="border-b border-code-blue-100 px-4 py-3">
            <p className="truncate text-sm font-semibold">{displayName(user)}</p>
            <p className="truncate text-xs text-code-blue/70">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => { close(); onLogout(); }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold hover:bg-code-blue-50"
          >
            <Icon icon={IconLogout} className="h-4 w-4" /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
