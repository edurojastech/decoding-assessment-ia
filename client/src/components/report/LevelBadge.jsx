import { Badge } from '../ui/index.js';

// Nível de maturidade (RN-05). Nível não é estado: usa as variantes neutras e o destaque Lime, nunca cores semânticas.
const VARIANTS = {
  Iniciante: 'default',
  'Básico': 'info',
  'Intermediário': 'info',
  'Avançado': 'highlight',
};

export const LEVELS = Object.keys(VARIANTS);

export function LevelBadge({ level, className }) {
  if (!level) return null;
  return <Badge variant={VARIANTS[level] ?? 'default'} className={className}>{level}</Badge>;
}
