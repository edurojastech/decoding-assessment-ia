import { colors } from '../theme/tokens.js';

// RF-12 / ADR-06: PDF gerado no navegador (html2canvas + jsPDF), sem serviço externo.
// Captura a versão A4 da devolutiva (components/report/ReportDocument.jsx) numa imagem só e
// monta as páginas recortando faixas: cabeçalho e rodapé em todas, e cada `data-pdf-block`
// (ou linha de blocos lado a lado) inteiro na mesma página.

const PAGE = { width: 210, height: 297 }; // A4 em mm
const BLOCK_GAP = 4; // mm entre blocos
const MAX_CANVAS_AREA = 15_000_000; // abaixo do limite de canvas do Safari no iOS (16,7 Mpx)
const CROP_BLEED = 2; // px além do bloco, para não cortar bordas arredondadas

// html2canvas 1.4 não entende as cores modernas que o Tailwind v4 gera (oklab/oklch/color-mix).
const UNSUPPORTED_COLOR = /oklab|oklch|lab\(|lch\(|color\(|color-mix/;
const COLOR_PROPS = [
  'color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
  'textDecorationColor', 'fill', 'stroke',
];

let pixel;
// Converte qualquer cor CSS em rgba() pintando 1 pixel.
function toRgba(value) {
  pixel ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  pixel.clearRect(0, 0, 1, 1);
  pixel.fillStyle = value;
  pixel.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = pixel.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

// Na cópia que o html2canvas renderiza: cores em rgba e raios "infinitos" do Tailwind limitados.
function normalizeForCapture(clonedDoc) {
  const root = clonedDoc.querySelector('[data-pdf-root]');
  if (!root) return;
  const view = clonedDoc.defaultView;
  for (const el of [root, ...root.querySelectorAll('*')]) {
    const style = view.getComputedStyle(el);
    for (const prop of COLOR_PROPS) {
      const value = style[prop];
      if (value && UNSUPPORTED_COLOR.test(value)) el.style[prop] = toRgba(value);
    }
    // Qualquer outra propriedade de cor (outline, text-stroke, caret...) que ainda venha em oklab/oklch.
    for (let i = 0; i < style.length; i += 1) {
      const name = style[i];
      if (!name.endsWith('color') || name.startsWith('--')) continue;
      const value = style.getPropertyValue(name);
      if (value && UNSUPPORTED_COLOR.test(value)) el.style.setProperty(name, toRgba(value));
    }
    if (UNSUPPORTED_COLOR.test(style.textShadow)) el.style.textShadow = 'none';
    if (UNSUPPORTED_COLOR.test(style.boxShadow)) el.style.boxShadow = 'none';
    if (UNSUPPORTED_COLOR.test(style.backgroundImage)) el.style.backgroundImage = 'none';
    if (parseFloat(style.borderTopLeftRadius) > 9999) el.style.borderRadius = '9999px';
  }
}

// O html2canvas mede a linha de base da fonte com um <img> fora da raiz; o preflight do Tailwind
// (img { display: block }) distorce a medida e o texto sai deslocado para baixo.
const BASELINE_FIX = 'body img:not([data-pdf-root] img) { display: inline !important; }';

function withBaselineFix(doc) {
  const style = doc.createElement('style');
  style.textContent = BASELINE_FIX;
  doc.head.appendChild(style);
  return () => style.remove();
}

// Retângulo do elemento relativo à raiz, em px.
function rectIn(root, el) {
  const r = el.getBoundingClientRect();
  const base = root.getBoundingClientRect();
  return { top: r.top - base.top, bottom: r.bottom - base.top };
}

// Junta blocos que dividem a mesma faixa vertical (ex.: cards lado a lado no grid).
function blockRows(root) {
  const rects = [...root.querySelectorAll('[data-pdf-block]')]
    .map((el) => rectIn(root, el))
    .sort((a, b) => a.top - b.top);
  const rows = [];
  for (const rect of rects) {
    const last = rows[rows.length - 1];
    if (last && rect.top < last.bottom - 1) last.bottom = Math.max(last.bottom, rect.bottom);
    else rows.push({ ...rect });
  }
  return rows;
}

async function waitForAssets(root) {
  await document.fonts?.ready;
  await Promise.all([...root.querySelectorAll('img')].map((img) => img.decode().catch(() => {})));
}

/**
 * Gera e baixa o PDF a partir da raiz `[data-pdf-root]` renderizada fora da tela.
 * O download é feito pelo navegador (jsPDF.save); nada é enviado a servidor algum.
 */
export async function downloadReportPdf(root, filename) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  await waitForAssets(root);

  const width = root.offsetWidth;
  const height = root.offsetHeight;
  const scale = Math.min(2, Math.sqrt(MAX_CANVAS_AREA / (width * height)));
  const removeFix = withBaselineFix(document);
  let canvas;
  try {
    canvas = await html2canvas(root, {
      scale,
      backgroundColor: colors.surface,
      useCORS: true,
      logging: false,
      onclone: (clonedDoc) => {
        withBaselineFix(clonedDoc);
        normalizeForCapture(clonedDoc);
      },
    });
  } finally {
    removeFix();
  }

  const mmPerPx = PAGE.width / width;
  const pxScale = canvas.width / width;

  // Recorta a faixa [top, bottom] (px da raiz) como JPEG.
  const strip = ({ top, bottom }, bleed = CROP_BLEED) => {
    const y = Math.max(0, top - bleed);
    const h = Math.min(height, bottom + bleed) - y;
    const piece = document.createElement('canvas');
    piece.width = canvas.width;
    piece.height = Math.round(h * pxScale);
    piece.getContext('2d').drawImage(canvas, 0, Math.round(y * pxScale), canvas.width, piece.height, 0, 0, piece.width, piece.height);
    return { data: piece.toDataURL('image/jpeg', 0.92), heightMm: h * mmPerPx };
  };

  const header = strip(rectIn(root, root.querySelector('[data-pdf-header]')), 0);
  const footer = strip(rectIn(root, root.querySelector('[data-pdf-footer]')), 0);
  const contentTop = header.heightMm;
  const contentBottom = PAGE.height - footer.heightMm;

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  const paintPage = () => {
    pdf.setFillColor(colors.surface);
    pdf.rect(0, 0, PAGE.width, PAGE.height, 'F');
    pdf.addImage(header.data, 'JPEG', 0, 0, PAGE.width, header.heightMm);
    pdf.addImage(footer.data, 'JPEG', 0, contentBottom, PAGE.width, footer.heightMm);
  };

  paintPage();
  let y = contentTop;
  for (const row of blockRows(root)) {
    const block = strip(row);
    let w = PAGE.width;
    let h = block.heightMm;
    const available = contentBottom - contentTop;
    if (h > available) {
      // Bloco maior que a página: reduz para caber inteiro.
      w *= available / h;
      h = available;
    }
    if (y + h > contentBottom) {
      pdf.addPage();
      paintPage();
      y = contentTop;
    }
    pdf.addImage(block.data, 'JPEG', (PAGE.width - w) / 2, y, w, h);
    y += h + BLOCK_GAP;
  }

  // Numeração no canto do rodapé (o rodapé reserva esse espaço à direita).
  const pages = pdf.getNumberOfPages();
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(colors.codeBlue);
  for (let i = 1; i <= pages; i += 1) {
    pdf.setPage(i);
    pdf.text(`Página ${i} de ${pages}`, PAGE.width - 10.5, contentBottom + footer.heightMm / 2, { align: 'right', baseline: 'middle' });
  }

  pdf.save(filename);
}
