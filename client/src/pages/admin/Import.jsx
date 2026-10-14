import { useRef, useState } from 'react';
import { api } from '../../lib/api.js';
import { Alert, Button, Card, CardBody, Textarea } from '../../components/ui/index.js';

const HEADER = 'nome,email,area';
const PLACEHOLDER = `${HEADER}\nAna Souza,ana.souza@empresa.com,RH\nCarlos Lima,carlos.lima@empresa.com,Comercial`;

// O Excel em pt-BR costuma salvar CSV em Windows-1252: tenta UTF-8 e, se falhar, usa 1252
// para não estragar os acentos.
async function readCsvFile(file) {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('windows-1252').decode(buffer);
  }
}

// RF-03 + RF-04 + RF-05: modelo para baixar, upload ou colar, validação por linha.
// O upload é lido no navegador e enviado como texto, igual ao colar.
export default function Import({ company, onImported, onShowParticipants }) {
  const fileInput = useRef(null);
  const [csv, setCsv] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setResult(null);
    try {
      setCsv(await readCsvFile(file));
      setFileName(file.name);
    } catch {
      setError('Não foi possível ler o arquivo. Confira se é um CSV e tente de novo.');
    }
  }

  async function handleTemplate() {
    setError('');
    try {
      await api.download('/template.csv', 'modelo-participantes.csv');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleImport(event) {
    event.preventDefault();
    setResult(null);
    if (!csv.trim()) {
      setError('Cole o conteúdo ou envie um arquivo CSV.');
      return;
    }
    setError('');
    setImporting(true);
    try {
      const data = await api.post(`/companies/${company.id}/participants/import`, { csv });
      setResult(data);
      // As inválidas ficam na área de texto para correção (seção 2.1 do original), sob o
      // cabeçalho enviado (mantém o separador usado).
      const header = csv.replace(/^﻿/, '').split(/\r?\n/).find((l) => l.trim()) ?? HEADER;
      setCsv(data.errors.length ? [header, ...data.errors.map((e) => e.raw)].join('\n') : '');
      setFileName('');
      if (data.imported > 0) onImported();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-start">
      <Card variant="gradient">
        <CardBody className="flex flex-col gap-4">
          <h2 className="text-h3">Formato da lista</h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-code-blue/80">
            <li>Colunas obrigatórias, nesta ordem: <strong className="font-semibold text-code-blue">nome, email, area</strong>.</li>
            <li>Cabeçalho na primeira linha e uma pessoa por linha.</li>
            <li>E-mail válido e único nesta empresa; nome e área preenchidos.</li>
            <li>Separador vírgula ou ponto e vírgula. Também dá para colar direto de uma planilha.</li>
          </ul>
          <pre className="overflow-x-auto rounded-lg bg-surface p-4 text-xs text-code-blue">{PLACEHOLDER}</pre>
          <Button variant="secondary" onClick={handleTemplate}>Baixar modelo CSV</Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <form onSubmit={handleImport} noValidate className="flex flex-col gap-5">
            <div>
              <h2 className="text-h3">Importar participantes</h2>
              <p className="mt-1 text-sm text-code-blue/80">
                Para {company.name}. Só as linhas válidas são importadas; cada pessoa recebe um link pessoal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFile}
                className="sr-only"
                tabIndex={-1}
                aria-label="Arquivo CSV"
              />
              <Button variant="secondary" onClick={() => fileInput.current?.click()}>Escolher arquivo CSV</Button>
              <span className="text-sm text-code-blue/70">
                {fileName ? `Arquivo: ${fileName}` : 'ou cole o conteúdo abaixo'}
              </span>
            </div>

            <Textarea
              label="Conteúdo do CSV"
              rows={10}
              placeholder={PLACEHOLDER}
              value={csv}
              onChange={(e) => { setCsv(e.target.value); setFileName(''); }}
              spellCheck={false}
              className="[&_textarea]:font-mono [&_textarea]:text-sm"
            />

            {error && <Alert variant="error">{error}</Alert>}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" variant="accent" size="lg" disabled={importing}>
                {importing ? 'Importando…' : 'Validar e importar'}
              </Button>
              {csv && (
                <Button variant="ghost" size="lg" onClick={() => { setCsv(''); setFileName(''); setResult(null); }}>
                  Limpar
                </Button>
              )}
            </div>
          </form>

          {result && (
            <div className="mt-6 flex flex-col gap-4" aria-live="polite">
              {result.imported > 0 && (
                <Alert variant="success" title={`${result.imported} ${result.imported === 1 ? 'pessoa importada' : 'pessoas importadas'}`}>
                  <p>Os links pessoais já foram gerados. Copie ou exporte na tela Participantes para distribuir.</p>
                  <Button variant="secondary" size="sm" className="mt-3" onClick={onShowParticipants}>
                    Ver participantes e links
                  </Button>
                </Alert>
              )}
              {result.imported === 0 && result.errors.length === 0 && (
                <Alert variant="info">Nenhuma linha para importar.</Alert>
              )}
              {result.errors.length > 0 && (
                <Alert
                  variant="warning"
                  title={`${result.errors.length} ${result.errors.length === 1 ? 'linha não importada' : 'linhas não importadas'}`}
                >
                  <p>Essas linhas ficaram na área de texto acima para você corrigir e importar de novo.</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {result.errors.map((e) => (
                      <li key={e.line} className="rounded-md bg-canvas/70 p-3">
                        <p><span className="font-semibold">Linha {e.line}:</span> {e.reason}</p>
                        {e.raw && <p className="mt-1 break-all font-mono text-xs text-code-blue/70">{e.raw}</p>}
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
