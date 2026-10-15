import { Link } from 'react-router';
import { IconChevronRight, IconCircleCheck } from '@tabler/icons-react';
import { Icon } from './Icon.jsx';
import { Badge } from './Badge.jsx';

// "Pede atenção" (specs/07): itens derivados dos dados reais; cada um leva à tela correspondente.
// `items`: [{ id, icon, title, text, to }]. Vazio = "Tudo em dia".
export function AttentionList({ items, loading, className }) {
  return (
    // Lista aberta, sem card: são as ações do admin, então ficam no topo e com leitura direta.
    <section aria-labelledby="pede-atencao" className={className}>
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-label text-code-blue-300">Pede atenção</p>
            <h2 id="pede-atencao" className="mt-2 text-h3">O que precisa de você</h2>
          </div>
          {items.length > 0 && <Badge variant="pending">{items.length}<span className="sr-only"> itens</span></Badge>}
        </div>

        {loading && <p role="status" className="text-sm text-code-blue/70">Carregando…</p>}

        {!loading && items.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-lime-50 p-4">
            <Icon icon={IconCircleCheck} className="h-5 w-5 shrink-0 text-lime-900" />
            <div>
              <p className="font-semibold">Tudo em dia</p>
              <p className="text-sm text-code-blue/70">Nada pendente nesta empresa por enquanto.</p>
            </div>
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul className="flex flex-col gap-2">
            {items.map(({ id, icon, title, text, to }) => (
              <li key={id}>
                <Link to={to} className="flex items-center gap-3 rounded-lg border border-code-blue-100 px-3 py-2.5 transition-colors duration-150 hover:border-insight hover:bg-code-blue-50">
                  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-insight-50">
                    <Icon icon={icon} className="h-[1.125rem] w-[1.125rem]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{title}</span>
                    {text && <span className="block text-xs text-code-blue/70">{text}</span>}
                  </span>
                  <Icon icon={IconChevronRight} className="h-4 w-4 shrink-0 text-code-blue/50" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
