import { Logo } from './Logo.jsx';
import { Footer } from './Footer.jsx';

// Moldura das telas do participante em fundo claro (identificação, questionário, conclusão).
export function ParticipantShell({ children }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-code-blue-100 bg-canvas">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Logo />
          <p className="hidden text-label text-code-blue/70 sm:block">Assessment de Maturidade em IA</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <Footer />
    </div>
  );
}
