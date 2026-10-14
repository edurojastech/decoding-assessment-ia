import { Logo } from './Logo.jsx';

// `wide`: no admin, o rodapé acompanha a largura total do painel.
export function Footer({ wide = false }) {
  return (
    <footer className="border-t border-code-blue-100 bg-canvas">
      <div className={`flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${wide ? 'py-4' : 'mx-auto max-w-6xl py-8'}`}>
        <Logo className="sm:self-center" />
        <div className="flex flex-col gap-1 sm:items-end">
          <p className="text-label text-code-blue">
            IA First. <span className="rounded-sm bg-pulse-lime px-1">Human Driven.</span>
          </p>
          <p className="text-xs text-code-blue/70">
            Diagnóstico de desenvolvimento para orientar a aprendizagem. Não substitui uma avaliação formal.
          </p>
        </div>
      </div>
    </footer>
  );
}
