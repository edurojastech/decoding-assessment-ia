// Escala sequencial de um só matiz (tints Code Blue, claro → escuro) para nível e score.
// Nível é ordinal, não estado: nunca cores semânticas. Texto Code Blue nos tints; branco no Code Blue.
export const LEVEL_TINTS = {
  Iniciante: 'bg-code-blue-100',
  'Básico': 'bg-code-blue-200',
  'Intermediário': 'bg-code-blue-300',
  'Avançado': 'bg-code-blue text-canvas',
};

// O nível de cada média vem calculado do servidor (regra 1); aqui só se escolhe a cor.
export const tintFor = (level) => LEVEL_TINTS[level] ?? 'bg-surface';

export function LevelLegend({ className = '' }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-2 text-xs ${className}`} aria-label="Legenda dos níveis">
      {Object.entries(LEVEL_TINTS).map(([level, tint]) => (
        <li key={level} className="flex items-center gap-2">
          <span aria-hidden="true" className={`h-3 w-3 rounded-sm border border-code-blue-100 ${tint}`} />
          {level}
        </li>
      ))}
    </ul>
  );
}
