import { cx } from './cx.js';

// Classes compartilhadas por Input, Select e Textarea.
// Fiel ao DS: https://design-system-decoding.vercel.app/componentes/inputs
// Label 14px medium; campo com borda de 1.5px #BAC6F2, raio 12px, px-4 py-2.5, texto 14px
// (16px no celular, para o iOS não dar zoom ao focar); erro em #DC2626 com mensagem de 12px.
// Exceção de acessibilidade: a dica usa Code Blue 70%, porque o #8AA0E8 do DS não atinge contraste 4.5:1.
export const fieldWrap = 'flex flex-col gap-1.5';
export const fieldLabel = 'text-sm font-medium text-code-blue';
export const fieldHint = 'text-xs text-code-blue/70';
export const fieldError = 'text-xs text-destructive';

export function fieldControl(error) {
  return cx(
    'w-full rounded-lg border-[1.5px] bg-canvas px-4 py-2.5 text-base text-code-blue sm:text-sm',
    'placeholder:text-text-muted outline-none transition-all duration-150',
    'focus:ring-4',
    error
      ? 'border-destructive focus:ring-destructive/15'
      : 'border-border-strong focus:border-insight focus:ring-insight-100',
  );
}
