import { LEVEL_TINTS } from './levelScale.jsx';

// Composição da turma por nível (seção 8): barra empilhada com 2px de respiro entre os segmentos.
// `composition`: { Iniciante: n, Básico: n, Intermediário: n, Avançado: n, incomplete: n }.
export function CompositionBar({ composition }) {
  const parts = [
    ...Object.entries(LEVEL_TINTS).map(([level, tint]) => ({ label: level, tint, count: composition[level] ?? 0 })),
    { label: 'Preenchimento incompleto', tint: 'bg-surface', count: composition.incomplete ?? 0 },
  ].filter((p) => p.count > 0);
  const total = parts.reduce((n, p) => n + p.count, 0);
  const description = parts.map((p) => `${p.label}: ${p.count}`).join(', ');

  if (!total) return <p className="text-sm text-code-blue/70">Nenhuma pessoa nesta turma ainda.</p>;

  return (
    <div className="flex flex-col gap-2">
      <div role="img" aria-label={`Composição por nível. ${description}.`} className="flex h-4 gap-0.5">
        {parts.map((p) => (
          <div
            key={p.label}
            title={`${p.label}: ${p.count}`}
            className={`h-full rounded-sm border border-code-blue-100 ${p.tint}`}
            style={{ flexGrow: p.count, flexBasis: 0 }}
          />
        ))}
      </div>
      <p className="text-xs text-code-blue/80">{description}</p>
    </div>
  );
}
