const TICKS = [0, 25, 50, 75, 100];

// Barras horizontais numa escala comum de 0 a 100 (marcas a cada 25, rótulos no eixo).
// Substitui o radar: barras alinhadas são mais fáceis de comparar. `data`: [{ id, name, score }].
export function ScoreBars({ data, label = 'Média por dimensão, de 0 a 100' }) {
  return (
    <figure className="flex flex-col gap-3">
      <ul aria-label={label} className="flex flex-col gap-3">
        {data.map((d) => (
          <li key={d.id} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
            <span className="truncate text-sm font-semibold">{d.name}</span>
            <div aria-hidden="true" className="relative h-3 rounded-sm bg-code-blue-50">
              {TICKS.slice(1, -1).map((t) => (
                <span key={t} className="absolute inset-y-0 w-px bg-code-blue-100" style={{ left: `${t}%` }} />
              ))}
              <div className="relative h-full rounded-sm bg-code-blue" style={{ width: `${d.score ?? 0}%` }} />
            </div>
            <span className="text-right text-sm font-semibold">{d.score ?? '—'}</span>
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="grid grid-cols-[7.5rem_1fr_2.5rem] gap-3 text-xs text-code-blue/60">
        <span />
        <span className="relative h-4">
          {TICKS.map((t) => (
            <span key={t} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${t}%` }}>{t}</span>
          ))}
        </span>
        <span />
      </div>
    </figure>
  );
}
