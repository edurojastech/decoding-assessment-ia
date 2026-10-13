// Barras de distribuição por nível (seção 8). Barra fina em Insight, rótulo de valor em texto.
// `levels`: [{ level, count, pct }] já calculado pelo servidor.
export function LevelBars({ levels, total }) {
  const max = Math.max(1, ...levels.map((l) => l.count));
  return (
    <ul className="flex flex-col gap-4" aria-label="Distribuição dos respondentes por nível">
      {levels.map((l) => (
        <li key={l.level} className="grid grid-cols-[112px_1fr_auto] items-center gap-3 sm:grid-cols-[128px_1fr_auto]">
          <span className="text-sm font-semibold">{l.level}</span>
          <div aria-hidden="true" className="h-3 overflow-hidden rounded-sm bg-code-blue-50" title={`${l.level}: ${l.count} de ${total} (${l.pct}%)`}>
            <div className="h-full rounded-r-sm bg-insight" style={{ width: `${(l.count / max) * 100}%` }} />
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
