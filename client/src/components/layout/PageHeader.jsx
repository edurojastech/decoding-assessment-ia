import { monthLabel } from './nav.js';

// Cabeçalho padrão das telas do admin (specs/07): eyebrow, H1 leve, subtítulo e ações à direita.
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="text-label text-code-blue-300">{eyebrow ?? `${monthLabel()} · Assessment de IA`}</p>
        <h1 className="mt-2 text-[32px] leading-tight font-light tracking-normal break-words">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-code-blue/70">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
