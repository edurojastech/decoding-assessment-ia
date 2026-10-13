import { useCallback, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { IconCheck, IconSelector } from '@tabler/icons-react';
import { Icon } from '../ui/Icon.jsx';
import { cx } from '../ui/cx.js';
import { useDismiss } from './useDismiss.js';
import { companyPath } from './nav.js';

// "Espaço de trabalho": empresa selecionada + troca de empresa (lista de /api/companies).
export function WorkspaceSwitcher({ companies, selected }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-lg border border-canvas/20 p-3 text-left transition-colors duration-150 hover:bg-canvas/5"
      >
        <img src="/brand/symbols/badge-lime.png" alt="" className="h-8 w-8 shrink-0 rounded-md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-canvas">{selected?.name ?? 'Selecione uma empresa'}</span>
          <span className="block truncate text-xs text-canvas/70">Assessment de IA</span>
        </span>
        <Icon icon={IconSelector} className="h-4 w-4 shrink-0 text-canvas/70" />
        <span className="sr-only">Trocar de empresa</span>
      </button>

      {open && (
        <div id={menuId} className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-lg bg-canvas text-code-blue shadow-lg">
          <p className="text-label px-4 pt-3 pb-2 text-[10px] text-code-blue/60">Empresas</p>
          <ul className="max-h-64 overflow-y-auto pb-2">
            {companies.length === 0 && <li className="px-4 py-2 text-sm text-code-blue/70">Nenhuma empresa cadastrada.</li>}
            {companies.map((c) => (
              <li key={c.id}>
                <Link
                  to={companyPath(c.id)}
                  onClick={close}
                  aria-current={c.id === selected?.id ? 'true' : undefined}
                  className={cx(
                    'flex items-center gap-2 px-4 py-2 text-sm hover:bg-code-blue-50',
                    c.id === selected?.id && 'font-semibold',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 text-xs text-code-blue/60">{c.coverage}%</span>
                  {c.id === selected?.id && <Icon icon={IconCheck} className="h-4 w-4 shrink-0" />}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/admin" onClick={close} className="block border-t border-code-blue-100 px-4 py-3 text-sm font-semibold hover:bg-code-blue-50">
            Ver todas as empresas
          </Link>
        </div>
      )}
    </div>
  );
}
