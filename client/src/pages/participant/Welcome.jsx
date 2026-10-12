import { Logo } from '../../components/Logo.jsx';
import { Footer } from '../../components/Footer.jsx';

// Placeholder da Fase 3 para /r/:token. Boas-vindas, consentimento e questionário: Fatia A.
export default function Welcome() {
  return (
    <div className="flex min-h-dvh flex-col">
      <section className="bg-mesh-dark flex-1 px-6 py-10 text-canvas sm:px-12 sm:py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <Logo tone="onDark" />
          <div>
            <p className="text-label text-insight">Assessment de Maturidade em IA</p>
            <h1 className="mt-4 text-3xl leading-tight sm:text-5xl">Decodifique seu potencial em IA.</h1>
            <p className="mt-4 text-base text-canvas/80 sm:text-lg">
              O questionário ainda está em preparação. Volte por este mesmo link em breve.
            </p>
          </div>
          <p className="text-label text-pulse-lime">IA First. Human Driven.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
