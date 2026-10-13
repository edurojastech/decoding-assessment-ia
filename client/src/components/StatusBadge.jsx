import { Badge } from './ui/index.js';

// Status de preenchimento do participante (cor semântica = estado, sempre com texto).
export const STATUS = [
  { value: 'pendente', label: 'Pendente', variant: 'pending' },
  { value: 'em_andamento', label: 'Em andamento', variant: 'info' },
  { value: 'concluido', label: 'Concluído', variant: 'success' },
];

export function StatusBadge({ status, className }) {
  const s = STATUS.find((item) => item.value === status);
  if (!s) return null;
  return <Badge variant={s.variant} className={className}>{s.label}</Badge>;
}
