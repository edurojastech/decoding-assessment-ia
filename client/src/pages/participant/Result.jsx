import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { api } from '../../lib/api.js';
import { ParticipantShell } from '../../components/ParticipantShell.jsx';
import { ReportContent } from '../../components/report/ReportContent.jsx';
import { ReportDocument, formatDate } from '../../components/report/ReportDocument.jsx';
import { IconCheck, IconDownload, IconLink } from '@tabler/icons-react';
import { copyText } from '../../lib/clipboard.js';
import { Alert, Button, Icon } from '../../components/ui/index.js';

// RF-11 + RF-12: devolutiva individual (blocos 1–6) e bloco 7, o PDF.
// O mesmo link reabre esta tela e permite baixar o PDF de novo.

const PDF_ERROR = 'Não foi possível gerar o PDF. Tente de novo; se continuar, use outro navegador ou um computador.';

const slug = (text) => text
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function DownloadButton({ busy, onClick, size = 'lg', className }) {
  return (
    <Button variant="accent" size={size} disabled={busy} onClick={onClick} className={className}>
      {!busy && <Icon icon={IconDownload} size={size === 'lg' ? 20 : 18} />}
      {busy ? 'Gerando PDF…' : 'Baixar PDF'}
    </Button>
  );
}

export default function Result({ token, justSubmitted }) {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [copied, setCopied] = useState(false);
  const documentRef = useRef(null);

  useEffect(() => {
    let active = true;
    api.get(`/r/${token}/result`)
      .then((d) => active && setData(d))
      .catch((err) => active && setLoadError(err.message));
    return () => { active = false; };
  }, [token]);

  // A versão A4 só é montada durante a geração: flushSync garante que ela já está no DOM.
  async function startPdf() {
    flushSync(() => {
      setPdfError('');
      setPdfBusy(true);
    });
    try {
      const { downloadReportPdf } = await import('../../lib/pdf.js');
      await downloadReportPdf(documentRef.current, `devolutiva-ia-${slug(data.participant.name)}.pdf`);
    } catch {
      setPdfError(PDF_ERROR);
    } finally {
      setPdfBusy(false);
    }
  }

  if (loadError) {
    return (
      <ParticipantShell>
        <h1 className="text-3xl">Não foi possível abrir a devolutiva</h1>
        <Alert variant="error" className="mt-6">{loadError}</Alert>
      </ParticipantShell>
    );
  }

  if (!data) {
    return (
      <ParticipantShell>
        <p role="status" className="text-code-blue/70">Carregando sua devolutiva…</p>
      </ParticipantShell>
    );
  }

  const { participant, report } = data;
  const firstName = participant.name.split(' ')[0];
  const details = [participant.companyName, participant.area].filter(Boolean).join(' · ');

  async function copyLink() {
    try {
      await copyText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const actions = (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="md" onClick={copyLink} aria-live="polite">
        <Icon icon={copied ? IconCheck : IconLink} size={18} />
        {copied ? 'Link copiado' : 'Copiar link'}
      </Button>
      <DownloadButton busy={pdfBusy} onClick={startPdf} size="md" />
    </div>
  );

  return (
    <ParticipantShell wide headerLabel="Devolutiva individual" headerSlot={actions}>
      {justSubmitted && (
        <Alert variant="success" title="Feito! Sua devolutiva está pronta." className="mb-6">
          <p>Suas respostas foram registradas. Leia com calma: o diagnóstico mostra onde você está hoje e por onde seguir.</p>
        </Alert>
      )}
      {pdfError && <Alert variant="error" className="mb-6">{pdfError}</Alert>}

      <ReportContent
        report={report}
        heading={<>{firstName}, esta é a sua <span className="text-pulse-lime">devolutiva.</span></>}
        details={`${details} · ${formatDate(report.submittedAt)}`}
      />

      {/* Bloco 7 · Exportação em PDF (RF-12): uma linha discreta no fim, sem repetir um bloco inteiro. */}
      <section
        aria-labelledby="bloco-pdf"
        className="mt-10 flex flex-col gap-4 rounded-2xl bg-code-blue-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-1">
          <h2 id="bloco-pdf" className="text-lg font-bold tracking-normal">Leve esta devolutiva com você</h2>
          <p className="text-sm text-code-blue/70">
            O PDF traz a sua identificação e todos os blocos desta página. Este link continua valendo: volte a ele quando quiser.
          </p>
        </div>
        <DownloadButton busy={pdfBusy} onClick={startPdf} />
      </section>

      {pdfBusy && <ReportDocument ref={documentRef} participant={participant} report={report} />}
    </ParticipantShell>
  );
}
