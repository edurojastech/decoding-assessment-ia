import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Alert, Avatar, Badge, Button, Card, CardBody, Input, Select } from '../../components/ui/index.js';
import { LevelBadge } from '../../components/report/LevelBadge.jsx';

// RF-15: grupos por maturidade, automáticos (seção 7). Só o nível classifica (RN-13); a área só filtra.
// Os grupos orientam as turmas, mas não viram turma sozinhos: criar a turma é uma ação da Decoding.

function PersonRow({ person }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-code-blue-100 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={person.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{person.name}</p>
          <p className="truncate text-sm text-code-blue/70">{person.area}{person.score !== null && ` · ${person.score} de 100`}</p>
        </div>
      </div>
      {person.turma
        ? <Badge variant="info">{person.turma.name}</Badge>
        : <Badge>Sem turma</Badge>}
    </li>
  );
}

function CreateFromGroup({ group, company, onCreated, onCancel }) {
  const free = group.participants.filter((p) => !p.turma);
  const [name, setName] = useState(`Turma ${group.level}`);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post(`/companies/${company.id}/turmas`, {
        name, sourceLevel: group.level, participantIds: free.map((p) => p.id),
      });
      onCreated(name.trim());
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 rounded-lg bg-surface p-4">
      <Input label="Nome da turma" value={name} maxLength={120} autoFocus onChange={(e) => setName(e.target.value)} error={error} />
      <p className="text-sm text-code-blue/80">
        Entram {free.length} {free.length === 1 ? 'pessoa' : 'pessoas'} deste grupo que ainda não têm turma, com o percurso
        “{group.offer}”. Depois dá para mover pessoas e juntar níveis vizinhos na tela Turmas.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Criando…' : 'Criar turma'}</Button>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>Cancelar</Button>
      </div>
    </form>
  );
}

function GroupCard({ group, company, open, onToggle, onCreated }) {
  const [creating, setCreating] = useState(false);
  const listId = `grupo-${group.level}`;
  const free = group.participants.filter((p) => !p.turma).length;

  return (
    <Card as="section" aria-labelledby={`${listId}-titulo`}>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-label text-code-blue/70">Grupo</p>
            <h2 id={`${listId}-titulo`} className="mt-1 text-lg font-bold">{group.level}</h2>
          </div>
          <LevelBadge level={group.level} />
        </div>
        <p className="text-3xl font-bold">
          {group.count} <span className="text-base font-normal">{group.count === 1 ? 'pessoa' : 'pessoas'}</span>
        </p>
        <p className="text-sm">Percurso sugerido: <strong>{group.offer}</strong></p>
        {group.count > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" aria-expanded={open} aria-controls={listId} onClick={onToggle}>
              {open ? 'Esconder lista' : 'Ver lista'}
            </Button>
            {!creating && free > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCreating(true)}>Criar turma com este grupo</Button>
            )}
          </div>
        )}
        {creating && (
          <CreateFromGroup
            group={group}
            company={company}
            onCancel={() => setCreating(false)}
            onCreated={(name) => { setCreating(false); onCreated(name); }}
          />
        )}
        {open && (
          <ul id={listId}>
            {group.participants.map((p) => <PersonRow key={p.id} person={p} />)}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

export default function Groups({ company, onNavigate }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [area, setArea] = useState('');
  const [open, setOpen] = useState({});
  const [notice, setNotice] = useState('');

  const load = useCallback(() => api.get(`/companies/${company.id}/groups`)
    .then((d) => { setData(d); setError(''); })
    .catch((err) => setError(err.message)), [company.id]);

  useEffect(() => { load(); }, [load]);

  if (error) return <Alert variant="error" title="Não foi possível carregar os grupos">{error}</Alert>;
  if (!data) return <p role="status" className="text-sm text-code-blue/70">Carregando…</p>;

  const filter = (list) => (area ? list.filter((p) => p.area === area) : list);
  const groups = data.levels.map((g) => {
    const participants = filter(g.participants);
    return { ...g, participants, count: participants.length };
  });
  const incomplete = filter(data.incomplete);
  const responded = groups.reduce((n, g) => n + g.count, 0) + incomplete.length;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-label text-code-blue/70">Visão dos respondentes</p>
            <p className="mt-2">
              {responded} {responded === 1 ? 'respondente' : 'respondentes'}
              {area ? ` em ${area}` : ` de ${data.coverage.invited} convidados (${data.coverage.coverage}% de cobertura)`}.
              Os grupos usam só o nível de maturidade.
            </p>
          </div>
          {company.areas.length > 1 && (
            <Select label="Área" value={area} onChange={(e) => setArea(e.target.value)} className="w-full sm:w-60">
              <option value="">Todas as áreas</option>
              {company.areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          )}
        </CardBody>
      </Card>

      {notice && (
        <Alert variant="success" title={`Turma “${notice}” criada`}>
          <button type="button" className="font-semibold underline underline-offset-4" onClick={() => onNavigate('turmas')}>
            Abrir Turmas
          </button>
        </Alert>
      )}

      {responded === 0 ? (
        <Card><CardBody><p className="text-code-blue/80">Ainda não há respondentes{area ? ' nesta área' : ''}.</p></CardBody></Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((g) => (
            <GroupCard
              key={g.level}
              group={g}
              company={company}
              open={Boolean(open[g.level])}
              onToggle={() => setOpen((o) => ({ ...o, [g.level]: !o[g.level] }))}
              onCreated={(name) => { setNotice(name); load(); }}
            />
          ))}
        </div>
      )}

      {incomplete.length > 0 && (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Sem nível: preenchimento incompleto</h2>
            <p className="text-sm text-code-blue/80">
              Essas pessoas responderam menos de 70% do questionário, então o estágio geral não foi calculado.
            </p>
            <ul>{incomplete.map((p) => <PersonRow key={p.id} person={p} />)}</ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
