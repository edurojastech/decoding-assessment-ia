import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { IconCheck, IconChevronDown, IconCopy, IconFilter } from '@tabler/icons-react';
import { api } from '../../lib/api.js';
import { copyText } from '../../lib/clipboard.js';
import { Alert, Avatar, Badge, Button, Card, CardBody, Icon, Pagination, Select, Tag } from '../../components/ui/index.js';
import { cx } from '../../components/ui/cx.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { useDismiss } from '../../components/layout/useDismiss.js';
import { LEVELS, LevelBadge } from '../../components/report/LevelBadge.jsx';
import { STATUS, StatusBadge } from '../../components/StatusBadge.jsx';

// Cada linha é um grid próprio: a coluna de ações tem largura fixa para alinhar com o cabeçalho.
const GRID = 'md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_14.5rem]';
const EMPTY_FILTERS = { area: '', level: '' };
const PAGE_SIZES = [8, 16, 32];
const AUTO = 0; // "Ajustar à tela": quantas linhas cabem sem rolar a página

// true quando a lista tem mais conteúdo do que a altura visível (a barra de rolagem aparece).
function useOverflowing(ref, deps) {
  const [over, setOver] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const check = () => setOver(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    [...el.children].forEach((child) => ro.observe(child));
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return over;
}

// Espaço da lista na janela sem rolar a página (só no desktop, onde a lista é tabela).
// Mede a altura de uma linha e o que vem depois da lista (rodapé do card, margem, rodapé do site).
// `rows` = linhas que cabem (modo "Ajustar à tela"); `maxHeight` = altura da lista: com 8/16/32 por página,
// o que passar disso rola dentro da tabela, e não na página.
function useFitRows(listRef, cardRef, enabled, deps) {
  const [fit, setFit] = useState({ rows: 8, maxHeight: undefined });
  useEffect(() => {
    if (!enabled) return undefined;
    const measure = () => {
      const list = listRef.current;
      const card = cardRef.current;
      const first = list?.firstElementChild;
      if (!list || !card || !first || !window.matchMedia('(min-width: 768px)').matches) return setFit({ rows: 8, maxHeight: undefined });
      const rowH = first.getBoundingClientRect().height;
      const listTop = list.getBoundingClientRect().top + window.scrollY;
      const rowsH = list.getBoundingClientRect().height;
      const afterList = card.getBoundingClientRect().bottom - list.getBoundingClientRect().top - rowsH;
      const main = card.closest('main');
      const mainPad = main ? parseFloat(getComputedStyle(main).paddingBottom) : 0;
      const footer = document.querySelector('footer')?.offsetHeight ?? 0;
      const available = window.innerHeight - listTop - afterList - mainPad - footer;
      const rows = Math.max(3, Math.floor(available / rowH));
      setFit({ rows, maxHeight: Math.max(available, rows * rowH) });
    };
    measure();
    document.fonts?.ready.then(measure); // as fontes da marca mudam a altura das linhas
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
  return fit;
}

// Status no painel de filtros, na ordem do painel; o filtro vive na URL (?status=, vindo dos KPIs).
const STATUS_CHIPS = [
  { value: 'concluido', label: 'Concluídos' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'pendente', label: 'Pendentes' },
];

function queryString(filters) {
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// Feedback temporário de "copiado" (a UI só afirma o que fez: copiou para a área de transferência).
function useFlash() {
  const [flash, setFlash] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const show = useCallback((value) => {
    setFlash(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlash(null), 2500);
  }, []);
  return [flash, show];
}

function LevelCell({ participant }) {
  if (participant.status !== 'concluido') return <span className="text-sm text-code-blue/50">—</span>;
  if (!participant.level || participant.incomplete) return <Badge className="whitespace-normal">Preenchimento incompleto</Badge>;
  return <LevelBadge level={participant.level} />;
}

function ParticipantRow({ participant, copied, onCopy, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(participant);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <li className="border-b border-code-blue-100 py-2.5 last:border-b-0">
      <div className={`grid gap-3 ${GRID} md:items-center md:gap-4`}>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={participant.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{participant.name}</p>
            <p className="truncate text-sm text-code-blue/70">{participant.email}</p>
          </div>
        </div>
        <p className="text-sm md:text-base"><span className="text-label mr-2 text-code-blue/60 md:hidden">Área</span>{participant.area}</p>
        {/* No celular, status e nível dividem a mesma linha; no desktop viram colunas. */}
        <div className="flex flex-wrap gap-2 md:contents">
          <div><StatusBadge status={participant.status} /></div>
          <div><LevelCell participant={participant} /></div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <Button variant="ghost" size="sm" onClick={() => onCopy(participant)} title={participant.link}>
            {copied ? <IconCheck size={16} stroke={2} aria-hidden="true" /> : <IconCopy size={16} stroke={2} aria-hidden="true" />}
            {copied ? 'Link copiado' : 'Copiar link'}
          </Button>
          {!confirming && (
            <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
              Excluir<span className="sr-only"> {participant.name}</span>
            </Button>
          )}
        </div>
      </div>
      {confirming && (
        <Alert variant="warning" className="mt-3" title={`Excluir ${participant.name}?`}>
          <p>O link pessoal deixa de funcionar e as respostas, se houver, são apagadas. Não dá para desfazer.</p>
          {error && <p className="mt-2 font-semibold">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo…' : 'Excluir definitivamente'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>Cancelar</Button>
          </div>
        </Alert>
      )}
    </li>
  );
}

// Botão "Filtros (n)" com painel: status, área e nível. n = filtros ativos.
function FiltersMenu({ company, status, setStatus, filters, setFilters, activeCount, showCounts, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  const toggleLevel = (level) => setFilters((f) => ({ ...f, level: f.level === level ? '' : level }));

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <Icon icon={IconFilter} size={18} />
        Filtros{activeCount > 0 && ` (${activeCount})`}
        <Icon icon={IconChevronDown} size={16} className={open ? 'rotate-180 transition-transform duration-150' : 'transition-transform duration-150'} />
      </Button>
      {open && (
        <div
          id={panelId}
          role="group"
          aria-label="Filtros"
          className="absolute right-0 z-40 mt-2 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-5 rounded-2xl border border-border-default bg-canvas p-5 shadow-lg"
        >
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-code-blue">Status</legend>
            <div className="flex flex-wrap gap-2">
              <Tag selected={!status} count={showCounts ? company.invited : undefined} onClick={() => setStatus('')}>Todos</Tag>
              {STATUS_CHIPS.map((s) => (
                <Tag
                  key={s.value}
                  selected={status === s.value}
                  count={showCounts ? company.statusCounts[s.value] : undefined}
                  onClick={() => setStatus(status === s.value ? '' : s.value)}
                >
                  {s.label}
                </Tag>
              ))}
            </div>
          </fieldset>
          <Select label="Área" value={filters.area} onChange={(e) => setFilters((f) => ({ ...f, area: e.target.value }))}>
            <option value="">Todas as áreas</option>
            {company.areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-code-blue">Nível</legend>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => (
                <Tag key={level} selected={filters.level === level} onClick={() => toggleLevel(level)}>{level}</Tag>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-between gap-2 border-t border-code-blue-100 pt-4">
            <Button variant="ghost" size="sm" onClick={onClear} disabled={activeCount === 0}>Limpar filtros</Button>
            <Button size="sm" onClick={close}>Ver resultados</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// RF-05 + RF-06 + RF-07 + RF-18: lista com status e nível, filtros, links para copiar ou exportar.
// `header`: eyebrow/título/subtítulo da tela; as ações (copiar e CSV) entram no cabeçalho.
export default function Participants({ company, header, onChanged, onImport }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = STATUS.some((s) => s.value === searchParams.get('status')) ? searchParams.get('status') : '';
  const setStatus = (value) => setSearchParams(value ? { status: value } : {}, { replace: true });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [participants, setParticipants] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [flash, showFlash] = useFlash();
  const [page, setPage] = useState(1);
  const [sizeChoice, setSizeChoice] = useState(AUTO);
  const listRef = useRef(null);
  const cardRef = useRef(null);

  const qs = queryString({ ...filters, status });
  const load = useCallback(() => api.get(`/companies/${company.id}/participants${qs}`)
    .then((data) => { setParticipants(data); setError(''); })
    .catch((err) => setError(err.message)), [company.id, qs]);

  useEffect(() => { load(); }, [load]);

  const activeCount = [status, filters.area, filters.level].filter(Boolean).length;
  const filtered = activeCount > 0;
  // Com área ou nível, as contagens por status deixariam de bater com a lista: some com elas.
  const showCounts = !filters.area && !filters.level;
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setStatus(''); };

  const total = participants?.length ?? 0;
  const fit = useFitRows(listRef, cardRef, total > 0, [total > 0]);
  const pageSize = sizeChoice === AUTO ? fit.rows : sizeChoice;
  // A tabela rola por dentro quando o conteúdo passa da altura (mais linhas que cabem, ou uma confirmação aberta).
  const scrolls = useOverflowing(listRef, [fit.maxHeight, pageSize, total]);
  // Filtro ou tamanho de página novo: volta para a primeira página.
  useEffect(() => { setPage(1); }, [qs, pageSize]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const visible = participants?.slice((current - 1) * pageSize, current * pageSize) ?? [];

  async function copy(text, flashKey) {
    setNotice('');
    try {
      await copyText(text);
      showFlash(flashKey);
    } catch (err) {
      setNotice(err.message);
    }
  }

  // Formato tabulado: cola direto numa planilha ou num e-mail. Copia a lista filtrada inteira, não só a página.
  const copyAll = () => copy(
    ['nome\temail\tlink', ...participants.map((p) => `${p.name}\t${p.email}\t${p.link}`)].join('\n'),
    'all',
  );

  async function exportCsv() {
    setNotice('');
    try {
      await api.download(`/companies/${company.id}/participants/export${qs}`, 'links.csv');
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function remove(participant) {
    await api.delete(`/participants/${participant.id}`);
    await load();
    onChanged();
  }

  const empty = company.invited === 0;
  const actions = !empty && (
    <>
      <Button variant="ghost" onClick={copyAll} disabled={!participants?.length}>
        {flash === 'all' ? 'Links copiados' : `Copiar ${filtered ? 'links filtrados' : 'todos os links'}`}
      </Button>
      <Button onClick={exportCsv} disabled={!participants?.length}>Baixar CSV de links</Button>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader {...header} actions={actions} />

      {empty ? (
        <Card>
          <CardBody className="flex flex-col items-start gap-4">
            <h2 className="text-h3">Nenhum participante ainda</h2>
            <p className="text-code-blue/80">
              Importe a lista enviada pela empresa (nome, email, area). Cada pessoa recebe um link pessoal para responder.
            </p>
            <Button variant="accent" onClick={onImport}>Importar participantes</Button>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {notice && <Alert variant="error">{notice}</Alert>}

          <Card ref={cardRef}>
            <CardBody className="flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-code-blue-100 pb-4">
                <p className="text-sm text-code-blue/80" role="status">
                  {participants
                    ? `${total} de ${company.invited} ${company.invited === 1 ? 'participante' : 'participantes'}`
                    : 'Carregando…'}
                </p>
                <FiltersMenu
                  company={company}
                  status={status}
                  setStatus={setStatus}
                  filters={filters}
                  setFilters={setFilters}
                  activeCount={activeCount}
                  showCounts={showCounts}
                  onClear={clearFilters}
                />
              </div>

              {error && <Alert variant="error" className="mt-4" title="Não foi possível carregar os participantes">{error}</Alert>}

              {participants?.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <p className="text-code-blue/70">Ninguém com esses filtros.</p>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar filtros</Button>
                </div>
              )}

              {total > 0 && (
                <>
                  <div aria-hidden="true" className={`text-label hidden gap-4 pt-4 pb-1 text-code-blue/60 md:grid ${GRID}`}>
                    <span>Pessoa</span><span>Área</span><span>Status</span><span>Nível</span><span className="text-center">Ações</span>
                  </div>
                  <ul
                    ref={listRef}
                    style={{ maxHeight: fit.maxHeight }}
                    // relative: textos sr-only (position: absolute) ficam presos à lista e não esticam a página.
                    className={cx(fit.maxHeight && 'relative overflow-y-auto overscroll-contain', scrolls && 'scrollbar-thin pr-4')}
                    tabIndex={scrolls ? 0 : undefined}
                    aria-label="Lista de participantes"
                  >
                    {visible.map((p) => (
                      <ParticipantRow
                        key={p.id}
                        participant={p}
                        copied={flash === p.id}
                        onCopy={(item) => copy(item.link, item.id)}
                        onDelete={remove}
                      />
                    ))}
                  </ul>
                  <div className="border-t border-code-blue-100 pt-4">
                    <Pagination
                      page={current}
                      pageSize={pageSize}
                      total={total}
                      onPage={setPage}
                      onPageSize={setSizeChoice}
                      sizeValue={sizeChoice}
                      sizes={[{ value: AUTO, label: 'Ajustar à tela' }, ...PAGE_SIZES]}
                      noun={total === 1 ? 'participante' : 'participantes'}
                    />
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
