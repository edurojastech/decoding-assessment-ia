import { chart } from '../../theme/tokens.js';

// Radar das 5 dimensões, escala 0–100 (specs/01-requisitos.md, pontos em aberto).
// SVG próprio, sem animação nem medição assíncrona: sai igual na tela e no PDF (html2canvas).
// Cores como atributos (tokens.js), porque o SVG é rasterizado fora do CSS da página.
// Os nomes ficam em HTML ao redor, para usar a fonte do DS.

const RINGS = [25, 50, 75, 100]; // limites das faixas de nível (RN-05)
const LABEL_RADIUS = 41; // % do contêiner, a partir do centro
const CHART_INSET = 20; // % de margem do SVG para caber os nomes

const angle = (i, n) => ((-90 + (360 / n) * i) * Math.PI) / 180;
const point = (i, n, r) => [Math.cos(angle(i, n)) * r, Math.sin(angle(i, n)) * r];
const polygon = (n, radiusFor) => Array.from({ length: n }, (_, i) => point(i, n, radiusFor(i)).join(',')).join(' ');

/** `data`: [{ id, name, score }] — score null = dados insuficientes (desenhado no centro). */
export function RadarChart({ data, className = '' }) {
  const n = data.length;
  const description = data
    .map((d) => `${d.name}: ${d.score === null ? 'dados insuficientes' : `${d.score} de 100`}`)
    .join('; ');

  return (
    <div role="img" aria-label={`Radar por dimensão. ${description}.`} className={`relative mx-auto aspect-square w-full max-w-[400px] ${className}`}>
      {/* Posição no wrapper: estilo no próprio <svg> iria junto quando o html2canvas o rasteriza. */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{ left: `${CHART_INSET}%`, top: `${CHART_INSET}%`, width: `${100 - 2 * CHART_INSET}%`, height: `${100 - 2 * CHART_INSET}%` }}
      >
        <svg viewBox="-100 -100 200 200" width="100%" height="100%">
          {RINGS.map((r) => (
            <polygon key={r} points={polygon(n, () => r)} fill="none" stroke={r === 100 ? chart.axis : chart.grid} strokeWidth="1" />
          ))}
          {data.map((d, i) => {
            const [x, y] = point(i, n, 100);
            return <line key={d.id} x1="0" y1="0" x2={x} y2={y} stroke={chart.grid} strokeWidth="1" />;
          })}
          <polygon
            points={polygon(n, (i) => data[i].score ?? 0)}
            fill={chart.fill}
            fillOpacity="0.45"
            stroke={chart.stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {data.map((d, i) => {
            if (d.score === null) return null;
            const [x, y] = point(i, n, d.score);
            return <circle key={d.id} cx={x} cy={y} r="4" fill={chart.highlight} stroke={chart.stroke} strokeWidth="2" />;
          })}
        </svg>
      </div>

      {data.map((d, i) => {
        const [x, y] = point(i, n, LABEL_RADIUS);
        return (
          <div
            key={d.id}
            aria-hidden="true"
            className="absolute flex w-[30%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center leading-tight"
            style={{ left: `${50 + x}%`, top: `${50 + y}%` }}
          >
            <span className="text-xs font-semibold">{d.name}</span>
            <span className="text-sm font-bold">{d.score ?? '—'}</span>
          </div>
        );
      })}
    </div>
  );
}
