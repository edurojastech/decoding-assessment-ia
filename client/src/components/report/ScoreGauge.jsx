import { chart, colors } from '../../theme/tokens.js';

// Medidor da nota geral (0–100) para o hero escuro da devolutiva.
// SVG com cores em atributos (tokens.js): sai igual na tela e no PDF (html2canvas). Número em HTML, na fonte do DS.
const SWEEP = 270; // arco aberto embaixo
const R = 50;

function arc(fraction) {
  const start = 135; // graus, sentido horário a partir do eixo x
  const end = start + SWEEP * fraction;
  const toXY = (deg) => [60 + R * Math.cos((deg * Math.PI) / 180), 60 + R * Math.sin((deg * Math.PI) / 180)];
  const [x1, y1] = toXY(start);
  const [x2, y2] = toXY(end);
  const large = SWEEP * fraction > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
}

export function ScoreGauge({ score, children }) {
  const fraction = Math.max(0, Math.min(1, (score ?? 0) / 100));
  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
        <path d={arc(1)} fill="none" stroke={colors.canvas} strokeOpacity="0.15" strokeWidth="9" strokeLinecap="round" />
        {fraction > 0 && (
          <path d={arc(fraction)} fill="none" stroke={chart.highlight} strokeWidth="9" strokeLinecap="round" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pt-2 text-center">
        {children}
      </div>
    </div>
  );
}
