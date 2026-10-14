import { Logo } from './Logo.jsx';
import { Footer } from './Footer.jsx';
import { StepIndicator } from './participant/StepIndicator.jsx';
import { cx } from './ui/cx.js';

// Moldura das telas do participante em fundo claro (perfil, perguntas, devolutiva).
// `wide`: largura de painel (perguntas e devolutiva); `step`: mostra a jornada em 4 passos.
export function ParticipantShell({ children, wide = false, step }) {
  const width = wide ? 'max-w-6xl' : 'max-w-3xl';
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-code-blue-100 bg-canvas">
        <div className={cx('mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6', width)}>
          <Logo />
          <p className="hidden text-label text-code-blue/70 sm:block">Assessment de Maturidade em IA</p>
        </div>
      </header>
      {step && (
        <div className="border-b border-code-blue-100 bg-canvas/60">
          <StepIndicator current={step} className={cx('mx-auto px-4 py-4 sm:px-6', width)} />
        </div>
      )}
      <main className={cx('mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-12', width)}>{children}</main>
      <Footer />
    </div>
  );
}
