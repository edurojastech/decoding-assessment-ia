import { colors } from '../theme/tokens.js';

// RF-12 / ADR-06 + guia "Front 2 · Relatório PDF": PDF gerado no navegador com jsPDF, desenhado em vetor.
// Texto selecionável (fonte Aileron incorporada), 4 páginas principais + apêndice de metodologia,
// layout editorial: estrutura por tipografia, fios e tabelas; bloco escuro só no resultado geral e no percurso.
// O conteúdo vem pronto do backend (`report.analysis`, services/reportAnalysis.js); aqui só se diagrama.

const PAGE = { w: 210, h: 297 };
const M = 18; // margem lateral (mm)
const CONTENT_W = PAGE.w - 2 * M;
const TOP = 30; // início do conteúdo, abaixo do cabeçalho
const BOTTOM = 276; // fim do conteúdo, acima do rodapé
const PT = 0.3528; // mm por ponto tipográfico
const SCALES = [1.16, 1.12, 1.08, 1.04, 1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76];

const FONT_FILES = {
  light: 'Aileron-Light.ttf',
  regular: 'Aileron-Regular.ttf',
  semibold: 'Aileron-SemiBold.ttf',
  bold: 'Aileron-Bold.ttf',
};
const FALLBACK = { light: 'helvetica', regular: 'helvetica', semibold: 'helvetica', bold: 'helvetica' };

const C = {
  ink: colors.codeBlue,
  muted: colors.textSecondary,
  soft: colors.textMuted,
  rule: colors.codeBlue100,
  track: colors.codeBlue50,
  insight: colors.insight,
  insightDark: colors.insight700,
  lime: colors.pulseLime,
  limeSoft: colors.lime50,
  limeDark: colors.lime900,
  limeText: colors.lime800,
  white: colors.canvas,
};

// Nível não é estado: cores neutras do DS, Lime só no Avançado (como no LevelBadge).
const LEVEL_TEXT = { Iniciante: colors.textSecondary, 'Básico': colors.insight700, 'Intermediário': colors.insight700, 'Avançado': colors.lime800 };
const LEVEL_BAR = { Iniciante: colors.codeBlue300, 'Básico': colors.insight, 'Intermediário': colors.insight, 'Avançado': colors.pulseLime };

// ---------- recursos ----------

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

async function registerFonts(pdf) {
  try {
    const entries = await Promise.all(Object.entries(FONT_FILES).map(async ([key, file]) => {
      const res = await fetch(`/fonts/pdf/${file}`);
      if (!res.ok) throw new Error(file);
      return [key, file, toBase64(await res.arrayBuffer())];
    }));
    const fonts = {};
    for (const [key, file, data] of entries) {
      const family = `Aileron-${key}`;
      pdf.addFileToVFS(file, data);
      pdf.addFont(file, family, 'normal');
      fonts[key] = family;
    }
    return fonts;
  } catch {
    return FALLBACK; // sem a fonte, o PDF sai em Helvetica, ainda com texto selecionável
  }
}

async function loadLogo() {
  try {
    const res = await fetch('/brand/logos/logo-on-light.png');
    if (!res.ok) return null;
    const data = `data:image/png;base64,${toBase64(await res.arrayBuffer())}`;
    const img = new Image();
    img.src = data;
    await img.decode();
    return { data, ratio: img.naturalWidth / img.naturalHeight };
  } catch {
    return null;
  }
}

// ---------- contexto de desenho (mede ou desenha) ----------

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function createCtx(pdf, fonts, draw) {
  const setFont = (weight, size, color) => {
    pdf.setFont(fonts[weight], 'normal');
    pdf.setFontSize(size);
    if (color) pdf.setTextColor(color);
  };
  const lineH = (size, lh) => size * PT * lh;

  return {
    draw,
    // Parágrafo com quebra automática; devolve a altura usada.
    para(text, x, y, w, { weight = 'regular', size = 9.5, color = C.ink, lh = 1.42, align = 'left' } = {}) {
      if (!text) return 0;
      setFont(weight, size, color);
      const lines = pdf.splitTextToSize(String(text), w);
      if (draw) {
        lines.forEach((line, i) => {
          const tx = align === 'right' ? x + w : align === 'center' ? x + w / 2 : x;
          pdf.text(line, tx, y + i * lineH(size, lh), { baseline: 'top', align });
        });
      }
      return lines.length * lineH(size, lh);
    },
    // Uma linha só, sem quebra.
    line(text, x, y, { weight = 'regular', size = 9.5, color = C.ink, align = 'left', charSpace = 0 } = {}) {
      setFont(weight, size, color);
      if (draw) {
        pdf.setCharSpace(charSpace);
        pdf.text(String(text), x, y, { baseline: 'top', align });
        pdf.setCharSpace(0);
      }
      return lineH(size, 1.2);
    },
    // Rótulo em caixa alta com espaçamento (regra do DS para labels).
    label(text, x, y, { size = 6.6, color = C.muted, weight = 'semibold', align = 'left' } = {}) {
      return this.line(String(text).toUpperCase(), x, y, { size, color, weight, align, charSpace: size * 0.045 });
    },
    width(text, weight, size, charSpace = 0) {
      setFont(weight, size);
      return pdf.getTextWidth(String(text)) + charSpace * Math.max(0, String(text).length - 1);
    },
    rule(x1, y1, x2, y2, color = C.rule, width = 0.25, dash = null) {
      if (!draw) return;
      pdf.setDrawColor(color);
      pdf.setLineWidth(width);
      if (dash) pdf.setLineDashPattern(dash, 0);
      pdf.line(x1, y1, x2, y2);
      if (dash) pdf.setLineDashPattern([], 0);
    },
    box(x, y, w, h, color, r = 0) {
      if (!draw || w <= 0 || h <= 0) return;
      pdf.setFillColor(color);
      if (r > 0) pdf.roundedRect(x, y, w, h, Math.min(r, h / 2, w / 2), Math.min(r, h / 2, w / 2), 'F');
      else pdf.rect(x, y, w, h, 'F');
    },
  };
}

// Mede a página em escalas decrescentes e desenha na maior que cabe.
function fitPage(pdf, fonts, build) {
  const measure = createCtx(pdf, fonts, false);
  const scale = SCALES.find((s) => build(measure, s) <= BOTTOM) ?? SCALES[SCALES.length - 1];
  build(createCtx(pdf, fonts, true), scale);
}

// ---------- peças reutilizadas ----------

function sectionTitle(c, s, y, number, title, subtitle) {
  const size = 15 * s;
  let h = 0;
  if (number) {
    c.line(number, M, y, { weight: 'bold', size, color: C.insight });
    c.line('·', M + c.width(number, 'bold', size) + 2, y, { weight: 'bold', size, color: C.soft });
  }
  const tx = number ? M + c.width(`${number} · `, 'bold', size) + 1.5 : M;
  h = c.line(title.toUpperCase(), tx, y, { weight: 'bold', size, color: C.ink, charSpace: 0.15 });
  if (subtitle) h += 1.5 + c.para(subtitle, M, y + h + 1.5, CONTENT_W, { size: 10 * s, color: C.muted });
  return h;
}

function scoreBar(c, x, y, w, score, level, height = 1.6) {
  c.box(x, y, w, height, C.track, height / 2);
  if (score > 0) c.box(x, y, (w * score) / 100, height, LEVEL_BAR[level] ?? C.insight, height / 2);
}

// ---------- página 1 · síntese e resultados ----------

function pageSynthesis(c, s, { participant, report, analysis }) {
  const { stage } = report;
  const syn = analysis.synthesis;
  let y = TOP;

  y += c.para('Assessment de Maturidade em IA', M, y, CONTENT_W, { weight: 'bold', size: 24 * s, lh: 1.1 });
  y += 3 * s;
  const ident = [
    participant.name, participant.companyName, participant.area, participant.role,
    `Aplicação ${formatDate(report.submittedAt)}`, `Instrumento v${analysis.instrument.questionnaire}`,
  ].filter(Boolean).join('  ·  ');
  y += c.para(ident, M, y, CONTENT_W, { size: Math.min(9.5, 9.5 * s), color: C.muted });
  y += 4 * s;
  c.rule(M, y, PAGE.w - M, y);
  y += 7 * s;

  y += sectionTitle(c, s, y, '01', 'Síntese e resultados');
  y += 6 * s;

  // Único bloco escuro da página: o resultado geral.
  const cardPad = 7 * s;
  const leftW = 52;
  const rightX = M + cardPad + leftW + 6;
  const rightW = PAGE.w - M - cardPad - rightX;
  const calculated = stage.status === 'calculado';
  const scopeText = syn.levelScope ?? syn.scope;
  const rightH = (calculated ? 4 * s + 1.5 * s + 6 * s + 3 * s : 0) + measureText(c, scopeText, rightW, 9.5 * s);
  const cardH = Math.max(32 * s, rightH + 2 * cardPad);
  c.box(M, y, CONTENT_W, cardH, C.ink, 3);
  if (calculated) {
    c.label('Resultado geral', M + cardPad, y + cardPad, { color: C.insight, size: 6.6 * s });
    const big = 40 * s;
    c.line(String(stage.score), M + cardPad, y + cardPad + 5 * s, { weight: 'bold', size: big, color: C.white });
    c.line('/100', M + cardPad + c.width(String(stage.score), 'bold', big) + 2, y + cardPad + 5 * s + big * PT * 0.55,
      { weight: 'light', size: 14 * s, color: C.soft });
  } else {
    c.label('Resultado geral', M + cardPad, y + cardPad, { color: C.insight, size: 6.6 * s });
    c.para('Não calculado', M + cardPad, y + cardPad + 6 * s, leftW, { weight: 'bold', size: 16 * s, color: C.white });
  }
  c.rule(rightX - 4, y + cardPad, rightX - 4, y + cardH - cardPad, colors.codeBlue700, 0.3);
  let ry = y + cardPad;
  if (calculated) {
    ry += c.label('Nível', rightX, ry, { color: C.soft, size: 6.6 * s }) + 1.5 * s;
    ry += c.line(stage.level.toUpperCase(), rightX, ry, { weight: 'bold', size: 13 * s, color: C.insight, charSpace: 0.5 }) + 3 * s;
  }
  c.para(scopeText, rightX, ry, rightW, { size: 9.5 * s, color: C.white });
  y += cardH + 8 * s;

  // Um único gráfico: barras horizontais das cinco dimensões, escala 0–100.
  const nameW = 38;
  const scoreW = 12;
  const levelW = 26;
  const barX = M + nameW + scoreW;
  const barW = CONTENT_W - nameW - scoreW - levelW - 4;
  c.label('Dimensão', M, y, { size: 6.6 * s });
  [0, 25, 50, 75, 100].forEach((t) => {
    c.line(String(t), barX + (barW * t) / 100, y, { size: 7 * s, color: C.soft, align: 'center' });
  });
  y += 5.5 * s;
  const gridTop = y;
  const rowH = 9.5 * s;
  for (const d of report.dimensions) {
    c.rule(M, y, PAGE.w - M, y);
    const mid = y + rowH / 2;
    c.line(d.name, M, mid - 2.1 * s, { weight: 'semibold', size: 10.5 * s });
    if (d.score !== null) {
      c.line(String(d.score), M + nameW + scoreW - 3, mid - 2.2 * s, { weight: 'bold', size: 11 * s, align: 'right' });
      scoreBar(c, barX, mid - 1.3 * s, barW, d.score, d.level, 2.6 * s);
      c.label(d.level, PAGE.w - M, mid - 1.3 * s, { color: LEVEL_TEXT[d.level], weight: 'bold', align: 'right', size: 6.8 * s });
    } else {
      c.label('Dados insuficientes', PAGE.w - M, mid - 1.3 * s, { color: C.soft, align: 'right', size: 6.8 * s });
    }
    y += rowH;
  }
  c.rule(M, y, PAGE.w - M, y);
  [25, 50, 75, 100].forEach((t) => {
    const x = barX + (barW * t) / 100;
    c.rule(x, gridTop, x, y, colors.codeBlue200, 0.2, [0.6, 0.9]);
  });
  y += 9 * s;

  // Leitura integrada.
  y += c.para('Leitura integrada', M, y, CONTENT_W, { weight: 'bold', size: 15 * s, lh: 1.1 }) + 3 * s;
  y += c.para(syn.paragraphs.join(' '), M, y, CONTENT_W * 0.86, { size: 11 * s, lh: 1.5 });
  if (report.consistency) {
    y += 3 * s;
    y += c.para(`${report.consistency.title}. ${report.consistency.text}`, M, y, CONTENT_W * 0.86, { size: 9 * s, color: C.muted });
  }
  y += 6 * s;
  c.rule(M, y, PAGE.w - M, y);
  y += 3 * s;
  y += c.para(syn.note, M, y, CONTENT_W, { weight: 'light', size: 8.5 * s, color: C.muted });
  return y;
}

// ---------- página 2 · análise por dimensão ----------

function pageDimensions(c, s, { analysis }) {
  let y = TOP;
  y += sectionTitle(c, s, y, '02', 'Análise por dimensão', 'Evidência selecionada, interpretação e comportamento a desenvolver em cada dimensão.');
  y += 5 * s;

  const leftW = 40;
  const labelX = M + leftW + 6;
  const labelW = 27;
  const textX = labelX + labelW;
  const textW = PAGE.w - M - textX;
  const body = 9.2 * s;

  for (const d of analysis.dimensions) {
    c.rule(M, y, PAGE.w - M, y);
    const top = y + 4 * s;
    // Coluna da nota.
    let ly = top;
    ly += c.label(d.name, M, ly, { size: 7.4 * s, color: C.ink, weight: 'bold' }) + 1.5 * s;
    if (d.score !== null) {
      ly += c.line(String(d.score), M, ly, { weight: 'bold', size: 24 * s }) + 0.5 * s;
      ly += c.label(d.level, M, ly, { color: LEVEL_TEXT[d.level], weight: 'bold', size: 6.8 * s }) + 2 * s;
      scoreBar(c, M, ly, leftW - 4, d.score, d.level, 1.6);
      ly += 3 * s;
    } else {
      ly += c.label('Dados insuficientes', M, ly, { color: C.soft, size: 6.8 * s }) + 2 * s;
    }

    // Coluna da análise.
    let ry = top;
    const row = (label, text) => {
      if (!text) return;
      c.label(label, labelX, ry + 0.6 * s, { size: 6.2 * s });
      ry += c.para(text, textX, ry, textW, { size: body, lh: 1.38 }) + 2.4 * s;
    };
    const evidence = d.evidence
      .map((e) => `${e.nature} · ${e.topic}: “${e.label}”.`)
      .join('\n');
    row('Evidência', evidence);
    row('Interpretação', d.interpretation);
    row('A desenvolver', d.develop);
    c.rule(labelX - 3, top, labelX - 3, Math.max(ly, ry) - 2 * s, C.rule, 0.2);
    y = Math.max(ly, ry) + 2.5 * s;
  }
  c.rule(M, y, PAGE.w - M, y);
  return y;
}

// ---------- página 3 · prioridades do perfil ----------

function pagePriorities(c, s, { analysis }) {
  const byId = Object.fromEntries(analysis.dimensions.map((d) => [d.id, d]));
  let y = TOP;
  y += sectionTitle(c, s, y, '03', 'Prioridades do perfil', 'O que a combinação das cinco dimensões acrescenta à leitura.');
  y += 7 * s;

  // Conexões em colunas de texto, separadas por fios verticais.
  const conns = analysis.connections;
  if (conns.length > 0) {
    const gap = 7;
    const colW = (CONTENT_W - gap * (conns.length - 1)) / conns.length;
    let maxH = 0;
    conns.forEach((conn, i) => {
      const x = M + i * (colW + gap);
      let cy = y;
      const tag = conn.dimensions.map((id) => `${byId[id].name} ${byId[id].score}`).join('  ·  ') || 'Autorrelato · Situações';
      cy += c.label(tag, x, cy, { color: C.insightDark, size: 6.4 * s }) + 2.5 * s;
      cy += c.para(conn.title, x, cy, colW, { weight: 'bold', size: 12 * s, lh: 1.2 }) + 2.5 * s;
      cy += c.para(conn.text, x, cy, colW, { size: 9.4 * s, lh: 1.45, color: C.ink });
      maxH = Math.max(maxH, cy - y);
      if (i > 0) c.rule(x - gap / 2, y, x - gap / 2, y + maxH, C.rule, 0.2);
    });
    // Fios verticais com a altura final.
    conns.forEach((_, i) => {
      if (i > 0) {
        const x = M + i * (colW + gap) - gap / 2;
        c.rule(x, y, x, y + maxH, C.rule, 0.2);
      }
    });
    y += maxH + 9 * s;
  }

  c.rule(M, y, PAGE.w - M, y);
  y += 7 * s;
  y += c.para('Sequência recomendada', M, y, CONTENT_W, { weight: 'bold', size: 15 * s, lh: 1.1 }) + 5 * s;

  // Tabela tipográfica: ordem | prioridade | justificativa.
  const col1 = 18;
  const col2 = 52;
  const jx = M + col1 + col2;
  const jw = PAGE.w - M - jx;
  c.label('Ordem', M, y, { size: 6.4 * s });
  c.label('Prioridade', M + col1, y, { size: 6.4 * s });
  c.label('Justificativa', jx, y, { size: 6.4 * s });
  y += 5 * s;
  for (const p of analysis.priorities) {
    c.rule(M, y, PAGE.w - M, y);
    const top = y + 4 * s;
    const h1 = c.line(String(p.order), M + 2, top - 1.5 * s, { weight: 'bold', size: 22 * s });
    const h2 = c.para(p.title, M + col1, top, col2 - 6, { weight: 'bold', size: 11 * s, lh: 1.25 });
    const nameH = c.label(p.name, M + col1, top + h2 + 1.2 * s, { size: 6.2 * s, color: C.soft });
    const h3 = c.para(p.justification, jx, top, jw, { size: 9.4 * s, lh: 1.45 });
    y = top + Math.max(h1 - 1.5 * s, h2 + 1.2 * s + nameH, h3) + 4 * s;
  }
  c.rule(M, y, PAGE.w - M, y);
  y += 3 * s;
  y += c.para('As prioridades combinam a nota, o conteúdo das respostas e a relevância para a função; não são apenas as menores notas.',
    M, y, CONTENT_W, { weight: 'light', size: 8.5 * s, color: C.muted });

  // Único destaque da página: respostas divergentes.
  if (analysis.divergence) {
    y += 7 * s;
    const pad = 5 * s;
    const bodyH = measureText(c, analysis.divergence, CONTENT_W - 2 * pad - 2, 9.6 * s, 1.45);
    const boxH = pad * 2 + 5 * s + bodyH;
    c.box(M, y, CONTENT_W, boxH, C.limeSoft, 1.5);
    c.box(M, y, 1.4, boxH, C.limeDark, 0);
    c.label('Respostas divergentes', M + pad + 2, y + pad, { color: C.limeText, weight: 'bold', size: 6.6 * s });
    c.para(analysis.divergence, M + pad + 2, y + pad + 5 * s, CONTENT_W - 2 * pad - 2, { size: 9.6 * s, lh: 1.45 });
    y += boxH;
  }
  return y;
}

// ---------- página 4 · plano de desenvolvimento ----------

function pagePlan(c, s, { participant, analysis }) {
  const { plan } = analysis;
  let y = TOP;
  y += sectionTitle(c, s, y, '04', 'Plano de desenvolvimento', 'Ciclo inicial de 30 dias · prazos sugeridos, a combinar com o participante.');
  y += 6 * s;

  // Tabela: quando | ação | entrega | como verificar.
  const whenW = 30;
  const colW = (CONTENT_W - whenW - 8) / 3;
  const xs = [M, M + whenW, M + whenW + colW + 4, M + whenW + 2 * (colW + 4)];
  ['Quando', 'Ação', 'Entrega', 'Como verificar'].forEach((h, i) => c.label(h, xs[i], y, { size: 6.4 * s }));
  y += 5 * s;
  for (const step of plan.steps) {
    c.rule(M, y, PAGE.w - M, y);
    const top = y + 4 * s;
    const [prefix, ...range] = step.period.split(' ');
    let wy = top;
    wy += c.label(prefix, M, wy, { size: 6.4 * s, color: C.ink, weight: 'bold' }) + 0.8 * s;
    wy += c.line(range.join(' ').replace(' a ', '–'), M, wy, { weight: 'bold', size: 17 * s });
    wy += 1 * s + c.label(step.name, M, wy + 1 * s, { size: 6 * s, color: C.soft });
    const opts = { size: 9.2 * s, lh: 1.42 };
    const h = Math.max(
      wy - top,
      c.para(step.action, xs[1], top, colW - 2, opts),
      c.para(step.delivery, xs[2], top, colW - 2, opts),
      c.para(step.verify, xs[3], top, colW - 2, opts),
    );
    y = top + h + 4.5 * s;
  }
  c.rule(M, y, PAGE.w - M, y);
  y += 9 * s;

  // Duas colunas de texto: evolução e continuidade.
  const half = (CONTENT_W - 10) / 2;
  const rx = M + half + 10;
  let ly = y;
  ly += c.para('Registrar a evolução', M, ly, half, { weight: 'bold', size: 13 * s, lh: 1.15 }) + 2.5 * s;
  ly += c.para(plan.evolution, M, ly, half, { size: 9.2 * s, color: C.ink }) + 2.5 * s;
  for (const item of plan.criteria) {
    c.box(M + 0.4, ly + 1.4 * s, 1.4 * s, 1.4 * s, C.insight, 0.7 * s);
    ly += c.para(item, M + 4.5, ly, half - 4.5, { size: 9.2 * s }) + 0.8 * s;
  }
  let ry = y;
  ry += c.para('Responsável pela continuidade', rx, ry, half, { weight: 'bold', size: 13 * s, lh: 1.15 }) + 2.5 * s;
  ry += c.para(plan.continuity, rx, ry, half, { size: 9.2 * s }) + 4 * s;
  ry += c.label('Participante', rx, ry, { size: 6.4 * s, color: C.ink, weight: 'bold' }) + 1.2 * s;
  ry += c.line(participant.name, rx, ry, { size: 10 * s }) + 1 * s;
  c.rule(rx, ry, rx + half, ry, colors.codeBlue200, 0.3);
  ry += 5 * s;
  ry += c.label('Acompanhamento', rx, ry, { size: 6.4 * s, color: C.ink, weight: 'bold' }) + 6 * s;
  c.rule(rx, ry, rx + half, ry, colors.codeBlue200, 0.3);
  c.rule(M + half + 5, y, M + half + 5, Math.max(ly, ry), C.rule, 0.2);
  y = Math.max(ly, ry) + 9 * s;

  // Único bloco escuro da página: o percurso sugerido.
  if (plan.offer) {
    const pad = 7 * s;
    const goal = plan.offer.goal ? `Objetivo de aprendizagem: ${plan.offer.goal}.` : '';
    const goalH = measureText(c, goal, CONTENT_W - 2 * pad, 9.8 * s, 1.45);
    const titleH = measureText(c, plan.offer.name, CONTENT_W - 2 * pad, 17 * s, 1.15, 'bold');
    const boxH = pad * 2 + 6 * s + titleH + 2.5 * s + goalH;
    c.box(M, y, CONTENT_W, boxH, C.ink, 3);
    c.label('Percurso sugerido · Trilha de IA', M + pad, y + pad, { color: C.lime, weight: 'bold', size: 6.6 * s });
    c.para(plan.offer.name, M + pad, y + pad + 6 * s, CONTENT_W - 2 * pad, { weight: 'bold', size: 17 * s, lh: 1.15, color: C.white });
    c.para(goal, M + pad, y + pad + 6 * s + titleH + 2.5 * s, CONTENT_W - 2 * pad, { size: 9.8 * s, lh: 1.45, color: C.white });
    y += boxH + 4 * s;
  }
  y += c.para(plan.note, M, y, CONTENT_W, { weight: 'light', size: 8.5 * s, color: C.muted });
  return y;
}

// Mede um parágrafo (sem desenhar), mesmo quando o contexto está desenhando.
function measureText(c, text, w, size, lh = 1.42, weight = 'regular') {
  return c.measure.para(text, 0, 0, w, { size, lh, weight });
}

// ---------- apêndice · metodologia (flui em quantas páginas precisar) ----------

function appendixSections(analysis) {
  const m = analysis.methodology;
  return [
    {
      title: 'As cinco dimensões',
      body: (c, s, y) => table(c, s, y, [['Dimensão', 30], ['O que mede', 0], ['Itens', 66]],
        m.dimensions.map((d) => [d.name, d.description, d.items]), { first: 'semibold' }),
    },
    {
      title: 'Escala e níveis',
      body: (c, s, y) => {
        const segW = CONTENT_W / 4;
        const fills = [colors.codeBlue100, colors.insight100, C.insight, C.lime];
        m.levels.forEach((l, i) => {
          c.box(M + i * segW, y, segW - 0.6, 3 * s, fills[i], i === 0 || i === 3 ? 1.5 * s : 0);
          c.line(l.range, M + i * segW + segW / 2, y + 5 * s, { weight: 'semibold', size: 8.5 * s, align: 'center' });
          c.label(l.level, M + i * segW + segW / 2, y + 9.5 * s, { size: 6.4 * s, align: 'center', color: LEVEL_TEXT[l.level] });
        });
        return 14 * s;
      },
    },
    {
      title: 'Pontuação e regras',
      body: (c, s, y) => table(c, s, y, [['Item', 34], ['Definição', 0]], m.rules.map((r) => [r.item, r.definition]), { first: 'semibold' }),
    },
    {
      title: 'Natureza das evidências',
      body: (c, s, y) => {
        const gap = 6;
        const colW = (CONTENT_W - 2 * gap) / 3;
        let maxH = 0;
        m.evidence.forEach((e, i) => {
          const x = M + i * (colW + gap);
          const dim = e.count === 0;
          let ey = y;
          ey += c.label(e.nature, x, ey, { size: 6.4 * s, color: dim ? C.soft : C.ink, weight: 'bold' }) + 1.8 * s;
          ey += c.para(e.description, x, ey, colW, { size: 8.8 * s, color: dim ? C.soft : C.ink }) + 1.2 * s;
          if (!dim) ey += c.line(`${e.count} respostas nesta avaliação`, x, ey, { size: 8 * s, color: C.muted });
          maxH = Math.max(maxH, ey - y);
        });
        [1, 2].forEach((i) => {
          const x = M + i * (colW + gap) - gap / 2;
          c.rule(x, y, x, y + maxH, C.rule, 0.2);
        });
        return maxH;
      },
    },
    {
      title: 'Limites de interpretação',
      body: (c, s, y) => {
        let h = 0;
        for (const text of m.limits) h += c.para(text, M, y + h, CONTENT_W, { size: 9.2 * s }) + 1.8 * s;
        return h;
      },
    },
  ];
}

function table(c, s, y, cols, rows, { first = 'regular' } = {}) {
  const widths = cols.map(([, w]) => w);
  const fixed = widths.reduce((a, b) => a + b, 0);
  const flex = widths.filter((w) => w === 0).length;
  const resolved = widths.map((w) => (w === 0 ? (CONTENT_W - fixed) / flex : w));
  const xs = resolved.map((_, i) => M + resolved.slice(0, i).reduce((a, b) => a + b, 0));
  let h = 0;
  cols.forEach(([name], i) => c.label(name, xs[i], y, { size: 6.2 * s }));
  h += 4.5 * s;
  for (const row of rows) {
    c.rule(M, y + h, PAGE.w - M, y + h);
    const top = y + h + 1.8 * s;
    const rowH = Math.max(...row.map((cell, i) => c.para(cell, xs[i], top, resolved[i] - 4,
      { size: 8.8 * s, lh: 1.38, weight: i === 0 ? first : 'regular' })));
    h += rowH + 3.6 * s;
  }
  c.rule(M, y + h, PAGE.w - M, y + h);
  return h;
}

function drawAppendix(pdf, fonts, analysis) {
  const sections = appendixSections(analysis);
  const measure = createCtx(pdf, fonts, false);
  measure.measure = measure;
  const sectionH = (c, s, sec, i) => {
    const titleSize = 11 * s;
    let h = c.line(`0${i + 1}  ${sec.title.toUpperCase()}`, M, 0, { weight: 'bold', size: titleSize, charSpace: 0.2 }) + 4 * s;
    h += sec.body(c, s, h);
    return h + 6 * s;
  };
  const headerH = (c, s) => sectionTitle(c, s, TOP, null, 'Apêndice · Metodologia',
    'Definições, cálculo efetivamente implementado e limites de interpretação.') + 8 * s;

  // Escolhe a maior escala em que o apêndice cabe numa página; se não couber, quebra entre seções.
  const total = (s) => headerH(measure, s) + sections.reduce((sum, sec, i) => sum + sectionH(measure, s, sec, i), 0);
  const s = SCALES.filter((sc) => sc <= 1).find((sc) => TOP + total(sc) <= BOTTOM) ?? SCALES[SCALES.length - 1];

  pdf.addPage();
  const c = createCtx(pdf, fonts, true);
  c.measure = measure;
  let y = TOP + headerH(c, s);
  sections.forEach((sec, i) => {
    const h = sectionH(measure, s, sec, i);
    if (y + h > BOTTOM && y > TOP + 20) {
      pdf.addPage();
      y = TOP;
    }
    const titleSize = 11 * s;
    c.line(`0${i + 1}`, M, y, { weight: 'bold', size: titleSize, color: C.insight });
    y += c.line(sec.title.toUpperCase(), M + 8, y, { weight: 'bold', size: titleSize, charSpace: 0.2 }) + 4 * s;
    y += sec.body(c, s, y) + 6 * s;
  });
}

// ---------- cabeçalho e rodapé (depois do layout, quando o total de páginas é conhecido) ----------

function drawChrome(pdf, fonts, logo, { participant, report, analysis }, mainPages) {
  const total = pdf.getNumberOfPages();
  const c = createCtx(pdf, fonts, true);
  for (let i = 1; i <= total; i += 1) {
    pdf.setPage(i);
    const appendix = i > mainPages;
    if (logo) pdf.addImage(logo.data, 'PNG', M, 11, 7 * logo.ratio, 7);
    else c.line('Decoding', M, 12, { weight: 'bold', size: 14 });
    const right = appendix ? 'Devolutiva individual · Apêndice' : 'Devolutiva individual';
    const label = right.toUpperCase();
    const size = 6.6;
    const cs = size * 0.045;
    const w = c.width(label, 'semibold', size, cs);
    c.label(right, PAGE.w - M - w, 13.2, { size, color: C.ink });
    if (i > 1) {
      const nameW = c.width(`${participant.name}   |   `, 'regular', 8);
      c.line(`${participant.name}   |`, PAGE.w - M - w - nameW, 12.8, { size: 8, color: C.muted });
    }
    // Fio com o degradê Insight → Lime do DS.
    const [r1, g1, b1] = hexToRgb(C.insight);
    const [r2, g2, b2] = hexToRgb(C.lime);
    const steps = 60;
    for (let k = 0; k < steps; k += 1) {
      const t = k / (steps - 1);
      pdf.setFillColor(Math.round(r1 + (r2 - r1) * t), Math.round(g1 + (g2 - g1) * t), Math.round(b1 + (b2 - b1) * t));
      pdf.rect(M + (CONTENT_W * k) / steps, 21, CONTENT_W / steps + 0.05, 0.7, 'F');
    }

    // Rodapé: assinatura do DS e paginação.
    c.rule(M, 281, PAGE.w - M, 281, C.rule, 0.3);
    const sig = 'IA FIRST.';
    const sigW = c.width(`${sig} `, 'bold', 7.5, 0.35);
    c.line(sig, M, 284.5, { weight: 'bold', size: 7.5, charSpace: 0.35 });
    const hd = 'HUMAN DRIVEN.';
    const hdW = c.width(hd, 'bold', 7.5, 0.35);
    c.box(M + sigW + 1, 283.6, hdW + 2, 4.4, C.lime, 0.5);
    c.line(hd, M + sigW + 2, 284.5, { weight: 'bold', size: 7.5, charSpace: 0.35 });
    const info = appendix
      ? `Instrumento v${analysis.instrument.questionnaire} · Avaliação de ${formatDate(report.submittedAt)} · Página ${i} de ${total}`
      : `Página ${i} de ${total}`;
    c.line(info, PAGE.w - M, 284.6, { size: 7.5, color: C.muted, align: 'right' });
  }
}

export function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : '';
}

/**
 * Monta o PDF da devolutiva (guia Front 2): síntese, análise por dimensão, prioridades,
 * plano e apêndice de metodologia. Devolve o documento jsPDF, sem baixar.
 */
export async function buildReportPdf({ participant, report }) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  pdf.setProperties({
    title: `Devolutiva individual · ${participant.name}`,
    subject: 'Decoding · Assessment de Maturidade em IA',
    author: 'Decoding',
    creator: 'Decoding · Assessment de Maturidade em IA',
  });
  const [fonts, logo] = await Promise.all([registerFonts(pdf), loadLogo()]);
  const data = { participant, report, analysis: report.analysis };
  const measure = createCtx(pdf, fonts, false);
  measure.measure = measure;

  const pages = [pageSynthesis, pageDimensions, pagePriorities, pagePlan];
  pages.forEach((build, i) => {
    if (i > 0) pdf.addPage();
    fitPage(pdf, fonts, (c, s) => {
      c.measure = measure;
      return build(c, s, data);
    });
  });
  drawAppendix(pdf, fonts, data.analysis);
  drawChrome(pdf, fonts, logo, data, pages.length);
  return pdf;
}

/** Gera e baixa o PDF. O download é feito pelo navegador; nada é enviado a servidor algum. */
export async function downloadReportPdf(data, filename) {
  const pdf = await buildReportPdf(data);
  pdf.save(filename);
}
