import { useState } from 'react';
import { Tag } from '../ui/index.js';
import { cx } from '../ui/cx.js';
import { LevelLegend, tintFor } from './levelScale.jsx';

const FEW = 3; // abaixo disso, a média da área pede cautela

// Necessidades por área (RF-14): mapa de calor área × dimensão. É uma <table>, então já é a visão em tabela.
// Cor = nível da média (calculado no servidor); o número sempre aparece. "Foco" = menor média da área.
// Filtro por dimensão (seção 8): ordena as áreas da menor para a maior média naquela dimensão.
export function Heatmap({ dimensions, rows }) {
  const [sortBy, setSortBy] = useState('');
  const sorted = sortBy
    ? [...rows].sort((a, b) => (a.dimensions[sortBy].average ?? 101) - (b.dimensions[sortBy].average ?? 101))
    : rows;

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-label mb-2 text-code-blue">Ordenar por dimensão</legend>
        <div className="flex flex-wrap gap-2">
          {dimensions.map((d) => (
            <Tag key={d.id} selected={sortBy === d.id} onClick={() => setSortBy((s) => (s === d.id ? '' : d.id))}>
              {d.name}
            </Tag>
          ))}
        </div>
      </fieldset>

      <div className="-mx-6 overflow-x-auto px-6">
        <table className="w-full min-w-[640px] border-separate border-spacing-0.5 text-sm">
          <caption className="sr-only">Média dos respondentes por área e dimensão, de 0 a 100</caption>
          <thead>
            <tr>
              <th scope="col" className="text-label px-2 py-2 text-left text-code-blue/70">Área</th>
              {dimensions.map((d) => (
                <th key={d.id} scope="col" className={cx('text-label px-2 py-2 text-center', sortBy === d.id ? 'text-code-blue' : 'text-code-blue/70')}>
                  {d.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.area}>
                <th scope="row" className="px-2 py-2 text-left align-middle font-semibold">
                  {row.area}
                  <span className="block text-xs font-normal text-code-blue/70">
                    {row.respondents} {row.respondents === 1 ? 'respondente' : 'respondentes'}
                    {row.respondents < FEW && ' · poucas respostas'}
                  </span>
                </th>
                {dimensions.map((d) => {
                  const cell = row.dimensions[d.id];
                  const focus = row.focus === d.id;
                  const label = cell.average === null
                    ? `${row.area}, ${d.name}: dados insuficientes`
                    : `${row.area}, ${d.name}: média ${cell.average} de 100 (${cell.level}), ${cell.n} ${cell.n === 1 ? 'pessoa' : 'pessoas'}${focus ? '. Onde focar nesta área' : ''}`;
                  return (
                    <td
                      key={d.id}
                      title={label}
                      className={cx(
                        'h-14 rounded-md px-2 text-center align-middle',
                        tintFor(cell.level),
                        focus && 'outline-2 -outline-offset-2 outline-code-blue ring-2 ring-inset ring-pulse-lime',
                      )}
                    >
                      <span className="sr-only">{label}</span>
                      <span aria-hidden="true" className="flex flex-col items-center gap-0.5">
                        <span className="text-base font-bold">{cell.average ?? '—'}</span>
                        {focus && <span className="rounded-full bg-pulse-lime px-2 text-code-blue text-[10px] font-semibold uppercase tracking-[0.2em]">foco</span>}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <LevelLegend />
        <p className="text-xs text-code-blue/70">Contorno e “foco”: a dimensão de menor média em cada área.</p>
      </div>
    </div>
  );
}
