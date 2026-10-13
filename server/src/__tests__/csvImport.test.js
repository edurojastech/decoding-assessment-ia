import { describe, expect, it } from 'vitest';
import { CsvImportError, TEMPLATE_CSV, parseCsv, toCsv, validateImport } from '../services/csvImport.js';

describe('parseCsv', () => {
  it('lê aspas, aspas escapadas, vírgula e quebra de linha dentro de aspas', () => {
    const records = parseCsv('nome,email,area\r\n"Souza, Ana",ana@x.com,RH\n"Carlos ""Caco""\nLima",c@x.com,TI');
    expect(records.map((r) => r.cells)).toEqual([
      ['nome', 'email', 'area'],
      ['Souza, Ana', 'ana@x.com', 'RH'],
      ['Carlos "Caco"\nLima', 'c@x.com', 'TI'],
    ]);
    // Linha onde cada registro começa no arquivo (cabeçalho = 1).
    expect(records.map((r) => r.line)).toEqual([1, 2, 3]);
  });

  it('aceita ";" (Excel pt-BR) e tabulação (colado de planilha), além de BOM', () => {
    expect(parseCsv('﻿nome;email;area\nAna;a@x.com;RH')[1].cells).toEqual(['Ana', 'a@x.com', 'RH']);
    expect(parseCsv('nome\temail\tarea\nAna\ta@x.com\tRH')[1].cells).toEqual(['Ana', 'a@x.com', 'RH']);
  });
});

describe('validateImport (RF-03, RF-04)', () => {
  it('importa só as linhas válidas e aponta o erro de cada inválida', () => {
    const csv = [
      'nome,email,area',
      'Ana Souza,Ana.Souza@Empresa.com,RH',
      'Sem Email,,Comercial',
      'Bia,bia@,Operações',
      ',sem.nome@empresa.com,RH',
      'Carlos,carlos@empresa.com,',
      'Ana Repetida,ana.souza@empresa.com,RH',
      'Já Existe,existe@empresa.com,RH',
      'Colunas,a@b.com,RH,extra',
      '',
      'Dani Lima , dani@empresa.com , Marketing ',
    ].join('\n');
    const { rows, errors } = validateImport(csv, new Set(['existe@empresa.com']));

    expect(rows).toEqual([
      { line: 2, name: 'Ana Souza', email: 'ana.souza@empresa.com', area: 'RH' },
      { line: 11, name: 'Dani Lima', email: 'dani@empresa.com', area: 'Marketing' },
    ]);
    expect(errors.map(({ line, reason }) => [line, reason])).toEqual([
      [3, 'E-mail não preenchido.'],
      [4, 'E-mail inválido.'],
      [5, 'Nome não preenchido.'],
      [6, 'Área não preenchida.'],
      [7, 'E-mail repetido no arquivo (já aparece na linha 2).'],
      [8, 'E-mail já cadastrado nesta empresa.'],
      [9, 'Esperadas 3 colunas (nome, email, area); a linha tem 4.'],
    ]);
    expect(errors[1].raw).toBe('Bia,bia@,Operações');
  });

  it('junta vários problemas da mesma linha', () => {
    const { errors } = validateImport('nome,email,area\n,x,');
    expect(errors[0].reason).toBe('Nome não preenchido. E-mail inválido. Área não preenchida.');
  });

  it('aceita cabeçalho com maiúsculas e acentos (Nome, E-mail, Área)', () => {
    expect(validateImport('Nome;E-mail;Área\nAna;a@x.com;RH').rows).toHaveLength(1);
  });

  it('recusa conteúdo vazio, cabeçalho fora da ordem e arquivo sem pessoas', () => {
    expect(() => validateImport('  \n ')).toThrow(CsvImportError);
    expect(() => validateImport('email,nome,area\na@x.com,Ana,RH')).toThrow(/nome,email,area/);
    expect(() => validateImport('nome,email,area\n')).toThrow(/só tem o cabeçalho/);
  });

  it('o modelo para baixar é um CSV válido com o cabeçalho e o exemplo do original', () => {
    const { rows, errors } = validateImport(TEMPLATE_CSV);
    expect(errors).toEqual([]);
    expect(rows.map((r) => r.email)).toEqual(['ana.souza@empresa.com', 'carlos.lima@empresa.com']);
    expect(TEMPLATE_CSV).toMatch(/^﻿nome,email,area\r\n/);
  });
});

describe('toCsv (RF-06)', () => {
  it('escapa aspas e vírgulas e neutraliza fórmulas', () => {
    expect(toCsv([['Souza, "Ana"', '=HYPERLINK("x")']])).toBe('﻿"Souza, ""Ana""","\'=HYPERLINK(""x"")"\r\n');
  });
});
