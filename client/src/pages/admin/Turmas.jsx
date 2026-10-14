import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Alert, Avatar, Badge, Button, Card, CardBody, Input, Select } from '../../components/ui/index.js';
import { LEVELS, LevelBadge } from '../../components/report/LevelBadge.jsx';
import { CompositionBar } from '../../components/charts/CompositionBar.jsx';
import { LevelLegend } from '../../components/charts/levelScale.jsx';

// RF-16: turmas manuais e revisáveis (seção 7). A Decoding cria, nomeia, edita e move pessoas;
// pode juntar níveis vizinhos. A oferta sugerida segue o mapeamento do portfólio, sem regra automática.
// Toda mutação devolve o quadro atualizado ({ turmas, unassigned, offers, offerByLevel }).

const NO_TURMA = '__sem_turma__';

function OfferSelect({ offers, value, onChange, label = 'Percurso (oferta)' }) {
  return (
    <Select label={label} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Sem oferta associada</option>
      {offers.map((o) => <option key={o} value={o}>{o}</option>)}
      {value && !offers.includes(value) && <option value={value}>{value}</option>}
    </Select>
  );
}

function LevelSelect({ value, onChange }) {
  return (
    <Select label="Nível de origem" hint="Opcional. Define a oferta sugerida." value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Sem nível de origem</option>
      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
    </Select>
  );
}

function TurmaForm({ board, initial, submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState(initial.name);
  const [sourceLevel, setSourceLevel] = useState(initial.sourceLevel ?? '');
  const [offer, setOffer] = useState(initial.offer ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Trocar o nível de origem traz a oferta do mapeamento (seção 7); dá para mudar depois.
  function changeLevel(level) {
    setSourceLevel(level);
    if (level) setOffer(board.offerByLevel[level]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome da turma.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ name, sourceLevel: sourceLevel || null, offer: offer || null });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Input label="Nome da turma" placeholder="Ex.: Turma A" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} error={error} />
        <LevelSelect value={sourceLevel} onChange={changeLevel} />
        <OfferSelect offers={board.offers} value={offer} onChange={setOffer} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Salvando…' : submitLabel}</Button>
        {onCancel && <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>Cancelar</Button>}
      </div>
    </form>
  );
}

// Destino de uma pessoa: outra turma ou "sem turma".
function MoveSelect({ person, turmas, currentId, onMove, label }) {
  return (
    <Select
      aria-label={`${label} ${person.name}`}
      value=""
      onChange={(e) => e.target.value && onMove(e.target.value === NO_TURMA ? null : Number(e.target.value))}
      className="w-full sm:w-56"
    >
      <option value="">{label}…</option>
      {turmas.filter((t) => t.id !== currentId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      {currentId !== null && <option value={NO_TURMA}>Sem turma</option>}
    </Select>
  );
}

function MemberRow({ person, leading, action }) {
  return (
    <li className="flex flex-col gap-3 border-b border-code-blue-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <Avatar name={person.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{person.name}</p>
          <p className="truncate text-sm text-code-blue/70">{person.area}{person.score !== null && ` · ${person.score} de 100`}</p>
        </div>
        <span className="shrink-0">
          {person.level ? <LevelBadge level={person.level} /> : <Badge>Incompleto</Badge>}
        </span>
      </div>
      {action}
    </li>
  );
}

function TurmaCard({ turma, board, onBoard }) {
  const [mode, setMode] = useState(null); // 'edit' | 'delete'
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action) {
    setError('');
    setBusy(true);
    try {
      onBoard(await action());
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const move = (person, toTurmaId) => run(() => api.patch(`/turmas/${turma.id}/move`, { participantId: person.id, toTurmaId }));
  const showSuggestion = turma.suggestedOffer && turma.suggestedOffer !== turma.offer;

  return (
    <Card as="section" variant="gradient" aria-labelledby={`turma-${turma.id}`}>
      <CardBody className="flex flex-col gap-5">
        {mode === 'edit' ? (
          <TurmaForm
            board={board}
            initial={turma}
            submitLabel="Salvar"
            onCancel={() => setMode(null)}
            onSubmit={async (fields) => {
              onBoard(await api.patch(`/turmas/${turma.id}`, fields));
              setMode(null);
            }}
          />
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-label text-code-blue/70">
                Turma{turma.sourceLevel && ` · origem ${turma.sourceLevel}`}
              </p>
              <h2 id={`turma-${turma.id}`} className="mt-1 break-words text-lg font-bold">{turma.name}</h2>
              <p className="mt-2 text-sm">
                {turma.offer ? <>Percurso: <strong>{turma.offer}</strong></> : 'Sem oferta associada'}
              </p>
            </div>
            {!mode && (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => setMode('edit')}>Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => setMode('delete')}>Excluir</Button>
              </div>
            )}
          </div>
        )}

        {mode === 'delete' && (
          <Alert variant="warning" title={`Excluir ${turma.name}?`}>
            <p>As {turma.participants.length} pessoas voltam para “Sem turma”. Respostas e resultados não são apagados.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="destructive" size="sm" disabled={busy} onClick={() => run(() => api.delete(`/turmas/${turma.id}`))}>
                {busy ? 'Excluindo…' : 'Excluir turma'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMode(null)} disabled={busy}>Cancelar</Button>
            </div>
          </Alert>
        )}

        {showSuggestion && mode !== 'edit' && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-lime-50 p-3 text-sm">
            <span>Oferta sugerida pela composição: <strong>{turma.suggestedOffer}</strong></span>
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => run(() => api.patch(`/turmas/${turma.id}`, { offer: turma.suggestedOffer }))}>
              Usar sugestão
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-label text-code-blue/70">Composição · {turma.participants.length} {turma.participants.length === 1 ? 'pessoa' : 'pessoas'}</h3>
          <CompositionBar composition={turma.composition} />
          {turma.focus.length > 0 && (
            <p className="text-sm text-code-blue/80">
              Foco por dimensão: {turma.focus.map((f) => `${f.name} (${f.average})`).join(' · ')}
            </p>
          )}
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {turma.participants.length > 0 && (
          <ul>
            {turma.participants.map((p) => (
              <MemberRow
                key={p.id}
                person={p}
                action={<MoveSelect person={p} turmas={board.turmas} currentId={turma.id} label="Mover para" onMove={(to) => move(p, to)} />}
              />
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

// Respondentes sem turma: seleção múltipla para adicionar de uma vez (ex.: juntar Iniciante e Básico).
function Unassigned({ board, onBoard }) {
  const [selected, setSelected] = useState(() => new Set());
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (id) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const selectLevel = (level) => setSelected(new Set(board.unassigned.filter((p) => p.level === level).map((p) => p.id)));

  async function add(turmaId, ids) {
    setError('');
    setBusy(true);
    try {
      onBoard(await api.post(`/turmas/${turmaId}/participants`, { participantIds: ids }));
      setSelected(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const levelsPresent = LEVELS.filter((l) => board.unassigned.some((p) => p.level === l));

  return (
    <Card as="section" aria-labelledby="sem-turma">
      <CardBody className="flex flex-col gap-4">
        <div>
          <p className="text-label text-code-blue/70">Respondentes</p>
          <h2 id="sem-turma" className="mt-1 text-lg font-bold">Sem turma · {board.unassigned.length}</h2>
        </div>
        {board.unassigned.length === 0 ? (
          <p className="text-sm text-code-blue/80">Todos os respondentes já estão em uma turma.</p>
        ) : (
          <>
            {board.turmas.length === 0 ? (
              <p className="text-sm text-code-blue/80">Crie uma turma acima para começar a distribuir as pessoas.</p>
            ) : (
              <div className="flex flex-col gap-3 rounded-lg bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-label text-code-blue/70">Selecionar</span>
                  {levelsPresent.map((l) => (
                    <Button key={l} variant="ghost" size="sm" onClick={() => selectLevel(l)}>{l}</Button>
                  ))}
                  {selected.size > 0 && <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Limpar</Button>}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Select label="Adicionar à turma" value={target} onChange={(e) => setTarget(e.target.value)} className="sm:w-72">
                    <option value="">Escolha a turma</option>
                    {board.turmas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                  <Button disabled={!target || selected.size === 0 || busy} onClick={() => add(Number(target), [...selected])} className="sm:h-11">
                    {busy ? 'Adicionando…' : `Adicionar ${selected.size || ''} ${selected.size === 1 ? 'pessoa' : 'pessoas'}`}
                  </Button>
                </div>
              </div>
            )}
            {error && <Alert variant="error">{error}</Alert>}
            <ul>
              {board.unassigned.map((p) => (
                <MemberRow
                  key={p.id}
                  person={p}
                  leading={board.turmas.length > 0 && (
                    <input
                      type="checkbox"
                      aria-label={`Selecionar ${p.name}`}
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="h-5 w-5 shrink-0 accent-code-blue"
                    />
                  )}
                  action={board.turmas.length > 0 && (
                    <MoveSelect person={p} turmas={board.turmas} currentId={null} label="Adicionar a" onMove={(to) => add(to, [p.id])} />
                  )}
                />
              ))}
            </ul>
          </>
        )}
      </CardBody>
    </Card>
  );
}

export default function Turmas({ company }) {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => api.get(`/companies/${company.id}/turmas`)
    .then((d) => { setBoard(d); setError(''); })
    .catch((err) => setError(err.message)), [company.id]);

  useEffect(() => { load(); }, [load]);

  if (error && !board) return <Alert variant="error" title="Não foi possível carregar as turmas">{error}</Alert>;
  if (!board) return <p role="status" className="text-sm text-code-blue/70">Carregando…</p>;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-label text-code-blue/70">Turmas revisáveis</p>
              <p className="mt-2 text-code-blue/80">
                Os grupos por maturidade orientam as turmas, mas a montagem é manual: junte níveis vizinhos quando um grupo
                tiver poucas pessoas e mova quem precisar.
              </p>
            </div>
            {!creating && <Button variant="accent" onClick={() => setCreating(true)}>Nova turma</Button>}
          </div>
          {creating && (
            <TurmaForm
              board={board}
              initial={{ name: '', sourceLevel: '', offer: '' }}
              submitLabel="Criar turma"
              onCancel={() => setCreating(false)}
              onSubmit={async (fields) => {
                setBoard(await api.post(`/companies/${company.id}/turmas`, fields));
                setCreating(false);
              }}
            />
          )}
          <LevelLegend />
        </CardBody>
      </Card>

      {board.turmas.length === 0 && (
        <Card><CardBody><p className="text-code-blue/80">Nenhuma turma ainda. Crie uma aqui ou a partir de um grupo na tela Grupos.</p></CardBody></Card>
      )}

      {board.turmas.map((t) => <TurmaCard key={t.id} turma={t} board={board} onBoard={setBoard} />)}

      <Unassigned board={board} onBoard={setBoard} />
    </div>
  );
}
