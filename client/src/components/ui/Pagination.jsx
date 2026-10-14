import { useId } from 'react';
import { IconChevronDown, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { cx } from './cx.js';
import { Icon } from './Icon.jsx';

// Números visíveis: todos até 7 páginas; depois, primeira, última e vizinhas da atual com "…".
function pageItems(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const items = new Set([1, pages, page - 1, page, page + 1]);
  const sorted = [...items].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ['…', n] : [n]));
}

const square = 'inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50';

// Rodapé de lista: "Exibindo X a Y de Z", páginas e itens por página.
// Botões no padrão do DS: página atual em Code Blue (primary), demais em tint (code-blue-50), setas em ghost.
export function Pagination({ page, pageSize, total, onPage, onPageSize, sizes = [8, 16, 32], noun = 'itens' }) {
  const sizeId = useId();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-code-blue/70" aria-live="polite">
        Exibindo {from} a {to} de {total} {noun}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Paginação" className="flex items-center gap-2">
          <button
            type="button"
            className={cx(square, 'border-[1.5px] border-code-blue-100 bg-canvas text-code-blue hover:border-code-blue-200')}
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            <Icon icon={IconChevronLeft} size={18} />
          </button>
          {pageItems(page, pages).map((item, i) => (item === '…'
            ? <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-sm text-code-blue/60">…</span>
            : (
              <button
                key={item}
                type="button"
                onClick={() => onPage(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Página ${item}`}
                className={cx(square, item === page
                  ? 'bg-code-blue text-canvas'
                  : 'bg-code-blue-50 text-code-blue hover:bg-code-blue-100')}
              >
                {item}
              </button>
            )))}
          <button
            type="button"
            className={cx(square, 'border-[1.5px] border-code-blue-100 bg-canvas text-code-blue hover:border-code-blue-200')}
            onClick={() => onPage(page + 1)}
            disabled={page >= pages}
            aria-label="Próxima página"
          >
            <Icon icon={IconChevronRight} size={18} />
          </button>
        </nav>
        <div className="relative">
          <label htmlFor={sizeId} className="sr-only">Itens por página</label>
          <select
            id={sizeId}
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-10 cursor-pointer appearance-none rounded-lg border-[1.5px] border-border-strong bg-canvas pl-4 pr-10 text-sm text-code-blue outline-none transition-all duration-150 focus:border-insight focus:ring-4 focus:ring-insight-100"
          >
            {sizes.map((n) => <option key={n} value={n}>{n} por página</option>)}
          </select>
          <Icon icon={IconChevronDown} className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        </div>
      </div>
    </div>
  );
}
