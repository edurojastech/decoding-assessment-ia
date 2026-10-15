// Barras de distribuição por nível (seção 8): largura = % dos respondentes (escala 0–100%, marcas a cada 25%),
// com quantidade e percentual em texto.
// `levels`: [{ level, count, pct }] já calculado pelo servidor.
export function LevelBars({ levels, total }) {
  return (
    <ul className="flex flex-col gap-4" aria-label="Distribuição dos respondentes por nível">
      {levels.map((l) => (
        <li key={l.level} className="grid grid-cols-[112px_1fr_auto] items-center gap-3 sm:grid-cols-[128px_1fr_auto]">
          <span className="text-sm font-semibold">{l.level}</span>
          <div aria-hidden="true" className="relative h-3 rounded-sm bg-code-blue-50" title={`${l.level}: ${l.count} de ${total} (${l.pct}%)`}>
            {[25, 50, 75].map((t) => <span key={t} className="absolute inset-y-0 w-px bg-code-blue-100" style={{ left: `${t}%` }} />)}
            <div className="relative h-full rounded-sm bg-insight" style={{ width: `${l.pct}%` }} />
          </div>
          <span className="w-20 text-right text-sm whitespace-nowrap">
            <span className="font-semibold">{l.count}</span>
            <span className="text-code-blue/70"> · {l.pct}%</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
