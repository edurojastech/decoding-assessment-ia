import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { api } from '../../lib/api.js';
import { ParticipantShell } from '../../components/ParticipantShell.jsx';
import { ReportContent } from '../../components/report/ReportContent.jsx';
import { ReportDocument, formatDate } from '../../components/report/ReportDocument.jsx';
import { Alert, Button, Card, CardBody } from '../../components/ui/index.js';

// RF-11 + RF-12: devolutiva individual (blocos 1–6) e bloco 7, o PDF.
// O mesmo link reabre esta tela e permite baixar o PDF de novo.

const PDF_ERROR = 'Não foi possível gerar o PDF. Tente de novo; se continuar, use outro navegador ou um computador.';

const slug = (text) => text
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function DownloadButton({ busy, onClick, size = 'lg' }) {
  return (
    <Button variant="accent" size={size} disabled={busy} onClick={onClick} className="sm:self-start">
      {busy ? 'Gerando PDF…' : 'Baixar PDF'}
    </Button>
  );
}

export default function Result({ token, justSubmitted }) {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState('');
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

  return (
    <ParticipantShell>
      <p className="text-label text-code-blue/70">Devolutiva individual</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">{firstName}, esta é a sua devolutiva</h1>
      <p className="mt-3 text-code-blue/80">
        {details} · respondido em {formatDate(report.submittedAt)}
      </p>

      {justSubmitted && (
        <Alert variant="success" title="Feito! Sua devolutiva está pronta para baixar." className="mt-6">
          <p>Suas respostas foram registradas. Leia com calma: o diagnóstico mostra onde você está hoje e por onde seguir.</p>
        </Alert>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <DownloadButton busy={pdfBusy} onClick={startPdf} size="md" />
        <p className="text-sm text-code-blue/70">Baixe uma cópia em PDF ou volte a este link quando quiser.</p>
      </div>

      <div className="mt-8">
        <ReportContent report={report} />
      </div>

      {/* Bloco 7 · Exportação em PDF (RF-12). */}
      <Card as="section" variant="gradient" aria-labelledby="bloco-pdf" className="mt-6">
        <CardBody className="flex flex-col gap-4 sm:p-8">
          <div>
            <p className="text-label text-code-blue/70">07 · Sua devolutiva em PDF</p>
            <h2 id="bloco-pdf" className="mt-2 text-h3">Leve esta devolutiva com você</h2>
          </div>
          <p>
            O PDF traz a sua identificação e todos os blocos desta página. Este link continua valendo:
            volte a ele quando quiser rever a devolutiva e baixar o PDF de novo.
          </p>
          <DownloadButton busy={pdfBusy} onClick={startPdf} />
          {pdfError && <Alert variant="error">{pdfError}</Alert>}
        </CardBody>
      </Card>

      {pdfBusy && <ReportDocument ref={documentRef} participant={participant} report={report} />}
    </ParticipantShell>
  );
}
