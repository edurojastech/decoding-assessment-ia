import { Validator } from 'sequelize';

// Seção 2.1 do original: colunas obrigatórias nome, email, area, nesta ordem, cabeçalho na 1ª linha.
export const CSV_COLUMNS = ['nome', 'email', 'area'];
export const MAX_IMPORT_ROWS = 5000;

// Limites iguais aos do model Participant (o Postgres recusa texto maior que a coluna).
const MAX_LENGTH = { name: 160, email: 254, area: 80 };

export const TEMPLATE_CSV = toCsv([
  CSV_COLUMNS,
  ['Ana Souza', 'ana.souza@empresa.com', 'RH'],
  ['Carlos Lima', 'carlos.lima@empresa.com', 'Comercial'],
]);

export class CsvImportError extends Error {}

// Excel em pt-BR salva CSV com ";"; colar de uma planilha gera tabulação.
function detectDelimiter(firstLine) {
  const candidates = [',', ';', '\t'];
  const counts = candidates.map((d) => firstLine.split(d).length - 1);
  const best = Math.max(...counts);
  return best === 0 ? ',' : candidates[counts.indexOf(best)];
}

// Parser CSV (RFC 4180): aspas, aspas escapadas ("") e quebras de linha dentro de aspas.
// Cada registro guarda a linha do arquivo onde começa e o texto original, para o relatório de erros.
export function parseCsv(text) {
  const source = String(text).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const delimiter = detectDelimiter(source.split('\n', 1)[0]);
  const records = [];
  let cells = [];
  let cell = '';
  let quoted = false;
  let line = 1;
  let startLine = 1;
  let startIndex = 0;

  const endRecord = (index) => {
    cells.push(cell);
    records.push({ line: startLine, cells, raw: source.slice(startIndex, index) });
    cells = [];
    cell = '';
    startLine = line + 1;
    startIndex = index + 1;
  };

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else {
        if (ch === '\n') line += 1;
        cell += ch;
      }
    } else if (ch === '"' && cell.trim() === '') {
      quoted = true;
      cell = '';
    } else if (ch === delimiter) {
      cells.push(cell);
      cell = '';
    } else if (ch === '\n') {
      endRecord(i);
      line += 1;
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || cells.length > 0) endRecord(source.length);
  return records;
}

const normalizeHeader = (value) => value
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[\s-]/g, '');

const clean = (value) => (value ?? '').trim().replace(/\s+/g, ' ');

// RF-03 + RF-04: valida linha a linha. Devolve as linhas válidas e os erros por linha
// ({line, reason, raw}); as inválidas ficam de fora para correção.
// `existingEmails`: e-mails já cadastrados na empresa (minúsculos).
export function validateImport(text, existingEmails = new Set()) {
  const records = parseCsv(text).filter((r) => r.cells.some((c) => c.trim() !== ''));
  if (records.length === 0) throw new CsvImportError('Cole o conteúdo ou envie um arquivo CSV.');

  const [header, ...data] = records;
  const columns = header.cells.map(normalizeHeader);
  if (columns.length !== CSV_COLUMNS.length || columns.some((c, i) => c !== CSV_COLUMNS[i])) {
    throw new CsvImportError('A primeira linha precisa ser o cabeçalho nome,email,area, nesta ordem.');
  }
  if (data.length === 0) throw new CsvImportError('O arquivo só tem o cabeçalho. Inclua uma pessoa por linha.');
  if (data.length > MAX_IMPORT_ROWS) {
    throw new CsvImportError(`Importe no máximo ${MAX_IMPORT_ROWS} pessoas por vez.`);
  }

  const rows = [];
  const errors = [];
  const seen = new Map();

  for (const record of data) {
    const issues = [];
    if (record.cells.length !== CSV_COLUMNS.length) {
      issues.push(`Esperadas 3 colunas (nome, email, area); a linha tem ${record.cells.length}.`);
    } else {
      const name = clean(record.cells[0]);
      const email = clean(record.cells[1]).toLowerCase();
      const area = clean(record.cells[2]);

      if (!name) issues.push('Nome não preenchido.');
      else if (name.length > MAX_LENGTH.name) issues.push(`Nome com mais de ${MAX_LENGTH.name} caracteres.`);

      if (!email) issues.push('E-mail não preenchido.');
      else if (email.length > MAX_LENGTH.email || !Validator.isEmail(email)) issues.push('E-mail inválido.');
      else if (seen.has(email)) issues.push(`E-mail repetido no arquivo (já aparece na linha ${seen.get(email)}).`);
      else if (existingEmails.has(email)) issues.push('E-mail já cadastrado nesta empresa.');

      if (!area) issues.push('Área não preenchida.');
      else if (area.length > MAX_LENGTH.area) issues.push(`Área com mais de ${MAX_LENGTH.area} caracteres.`);

      if (email && !seen.has(email)) seen.set(email, record.line);
      if (issues.length === 0) rows.push({ line: record.line, name, email, area });
    }
    if (issues.length > 0) errors.push({ line: record.line, reason: issues.join(' '), raw: record.raw });
  }

  return { rows, errors };
}

// Exportação (RF-06). Células que começam com = + - @ viram texto, para a planilha não
// interpretar um nome como fórmula.
function csvCell(value) {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// BOM para o Excel abrir os acentos corretamente.
export function toCsv(rows) {
  return `﻿${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
