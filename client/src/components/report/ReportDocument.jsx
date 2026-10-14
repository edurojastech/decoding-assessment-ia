import { forwardRef } from 'react';
import { Logo } from '../Logo.jsx';
import { ReportContent } from './ReportContent.jsx';

// RF-12: versão da devolutiva para o PDF — largura fixa de A4 (794 px a 96 dpi), fora da tela.
// lib/pdf.js repete o cabeçalho (identificação) e o rodapé (assinatura) em todas as páginas.
export const PDF_WIDTH = 794;

export function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : '';
}

export const ReportDocument = forwardRef(function ReportDocument({ participant, report }, ref) {
  const details = [participant.companyName, participant.area, participant.role].filter(Boolean).join(' · ');
  return (
    <div
      ref={ref}
      data-pdf-root
      aria-hidden="true"
      inert
      className="pointer-events-none absolute top-0 left-[-10000px] bg-surface px-10 text-code-blue"
      style={{ width: PDF_WIDTH }}
    >
      <header data-pdf-header className="flex flex-col gap-4 pt-8 pb-6">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <p className="text-label text-code-blue/70">Devolutiva individual</p>
        </div>
        <div className="h-1 w-full rounded-full bg-insight-lime" />
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xl font-bold">{participant.name}</p>
            <p className="text-sm text-code-blue/80">{details}</p>
          </div>
          <p className="text-sm whitespace-nowrap text-code-blue/80">Respondido em {formatDate(report.submittedAt)}</p>
        </div>
      </header>

      <ReportContent report={report} expanded />

      <footer data-pdf-footer className="mt-6 flex flex-col gap-1 border-t border-code-blue-100 pt-4 pb-6 pr-28">
        <p className="text-label text-code-blue">
          IA First. <span className="rounded-sm bg-pulse-lime px-1">Human Driven.</span>
        </p>
        <p className="text-xs text-code-blue/70">
          Decoding · Assessment de Maturidade em IA. Diagnóstico de desenvolvimento para orientar a aprendizagem;
          não substitui uma avaliação formal. Reabra esta devolutiva pelo seu link pessoal.
        </p>
      </footer>
    </div>
  );
});
