import { monthLabel } from './nav.js';

// Cabeçalho padrão das telas do admin (specs/07): eyebrow, H1 36px Bold (H2 da escala do DS), subtítulo e ações à direita.
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="text-label text-code-blue-300">{eyebrow ?? `${monthLabel()} · Assessment de IA`}</p>
        <h1 className="mt-2 text-[1.75rem] leading-tight font-bold break-words sm:text-h2">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-code-blue/70">{subtitle}</p>}
      </div>
      {/* No celular, as ações ocupam 50% cada (uma 3ª ação desce para a linha de baixo, inteira); no desktop ficam no tamanho natural. */}
      {actions && <div className="flex shrink-0 flex-wrap gap-2 [&>*]:flex-[1_1_calc(50%-0.25rem)] md:[&>*]:flex-none">{actions}</div>}
    </div>
  );
}
