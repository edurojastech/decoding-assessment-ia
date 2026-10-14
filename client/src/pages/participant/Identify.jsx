import { useState } from 'react';
import { IconArrowRight, IconBriefcase, IconCheck, IconPencil, IconSparkles, IconUser } from '@tabler/icons-react';
import { api } from '../../lib/api.js';
import { ParticipantShell } from '../../components/ParticipantShell.jsx';
import { Alert, Button, Card, Icon, Input, Select } from '../../components/ui/index.js';
import { TOOL_ICONS } from '../../components/participant/toolIcons.js';
import { cx } from '../../components/ui/cx.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NONE_TOOL = 'Nenhuma';

function SectionHeading({ icon, title, id, action, children }) {
  return (
    <div className="flex items-start gap-4">
      <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-code-blue-50 text-code-blue">
        <Icon icon={icon} size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id={id} className="text-xl leading-snug font-bold tracking-normal">{title}</h2>
        {children && <p className="mt-0.5 text-sm text-code-blue/70">{children}</p>}
      </div>
      {action}
    </div>
  );
}

// Ferramenta de IA em card com checkbox e ícone (P0c). Checkbox nativo escondido, acessível por teclado.
function ToolOption({ tool, checked, onChange, className }) {
  const ToolIcon = TOOL_ICONS[tool] ?? IconSparkles;
  return (
    <label
      className={cx(
        'flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors duration-150',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-insight',
        checked ? 'border-insight bg-insight-50' : 'border-code-blue-100 bg-canvas hover:border-code-blue-200',
        className,
      )}
    >
      <input type="checkbox" name="tools" value={tool} checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden="true"
        className={cx(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2',
          checked ? 'border-code-blue bg-code-blue text-canvas' : 'border-code-blue-200 bg-canvas',
        )}
      >
        {checked && <Icon icon={IconCheck} size={14} stroke={3} />}
      </span>
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-code-blue-50 text-code-blue">
        <Icon icon={ToolIcon} size={20} />
      </span>
      <span className="font-medium">{tool}</span>
    </label>
  );
}

// RF-09 + perguntas de perfil (RF-10, P0a–P0c) numa única etapa "Seu perfil":
// identificação importada em modo leitura (com "Editar"), função e ferramentas. O perfil não pontua (RN-12).
export default function Identify({ token, participant, questionnaire, onConfirmed, onBack }) {
  const [form, setForm] = useState({ name: participant.name, email: participant.email, area: participant.area });
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(participant.role ?? '');
  const [tools, setTools] = useState(participant.tools ?? []);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const profile = Object.fromEntries(questionnaire.profile.map((p) => [p.id, p]));
  // P0a: lista do original; mantém a área importada se ela não estiver na lista.
  const areaOptions = profile.P0a.options;
  const areas = areaOptions.includes(participant.area) ? areaOptions : [participant.area, ...areaOptions];
  const questionCount = questionnaire.dimensions.reduce((s, d) => s + d.questions.length, 0);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function toggleTool(tool, checked) {
    if (!checked) return setTools(tools.filter((t) => t !== tool));
    // "Nenhuma" não se combina com as demais ferramentas.
    return setTools(tool === NONE_TOOL ? [NONE_TOOL] : [...tools.filter((t) => t !== NONE_TOOL), tool]);
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Informe seu nome.';
    if (!EMAIL.test(form.email.trim())) next.email = 'Informe um e-mail válido.';
    if (!form.area) next.area = 'Selecione sua área.';
    setErrors(next);
    if (Object.keys(next).length > 0) setEditing(true);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    setSaving(true);
    try {
      const { participant: updated } = await api.patch(`/r/${token}`, { ...form, role, tools });
      onConfirmed(updated);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const readRows = [
    { label: 'Nome', value: form.name },
    { label: 'E-mail', value: form.email },
    { label: 'Área', value: form.area },
  ];

  return (
    <ParticipantShell wide step="profile" questionCount={questionCount}>
      <div className="flex flex-col gap-2">
        <p className="text-label text-code-blue/70">Antes das perguntas</p>
        <h1 className="text-4xl lg:text-h1">Complete seu <span className="text-lime-900">perfil</span></h1>
        <p className="text-lg text-code-blue/80">
          Estas informações ajudam a contextualizar o diagnóstico e não entram na pontuação.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <Card className="grid gap-10 p-6 sm:p-8 lg:grid-cols-2 lg:gap-0">
          {/* Coluna 1 · Seus dados + função */}
          <div className="flex flex-col gap-6 lg:pr-10">
            <section aria-labelledby="dados-titulo" className="flex flex-col gap-4">
              <SectionHeading
                icon={IconUser}
                id="dados-titulo"
                title="Seus dados"
                action={!editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-sm font-semibold text-code-blue-700 underline underline-offset-4"
                  >
                    <Icon icon={IconPencil} size={16} />
                    Editar
                  </button>
                )}
              >
                Estes dados vieram da {participant.companyName}. Se algo estiver diferente, corrija antes de seguir.
              </SectionHeading>

              {editing ? (
                <div className="flex flex-col gap-4">
                  <Input label="Nome" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
                  <Input
                    label="E-mail" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email}
                  />
                  <Select label="Área" value={form.area} onChange={set('area')} error={errors.area}>
                    {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                  </Select>
                </div>
              ) : (
                <dl className="flex flex-col gap-2">
                  {readRows.map((r) => (
                    <div key={r.label} className="rounded-xl bg-code-blue-50 px-4 py-2.5">
                      <dt className="text-xs text-code-blue/70">{r.label}</dt>
                      <dd className="break-words">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            <section aria-labelledby="funcao-titulo" className="flex flex-col gap-4 border-t border-code-blue-100 pt-6">
              <SectionHeading icon={IconBriefcase} id="funcao-titulo" title="Sua função">
                Descreva o papel que você exerce hoje.
              </SectionHeading>
              <Input
                aria-labelledby="funcao-titulo"
                placeholder="Ex.: Gerente de operações"
                maxLength={120}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </section>
          </div>

          {/* Coluna 2 · Ferramentas de IA (P0c) + ações */}
          <div className="flex flex-col gap-6 lg:border-l lg:border-code-blue-100 lg:pl-10">
            <fieldset className="flex flex-col gap-4">
              <legend className="sr-only">{profile.P0c.text}</legend>
              <SectionHeading icon={IconSparkles} title={profile.P0c.text}>Marque todas as que se aplicam.</SectionHeading>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.P0c.options.map((tool, i, all) => (
                  <ToolOption
                    key={tool}
                    tool={tool}
                    checked={tools.includes(tool)}
                    onChange={(e) => toggleTool(tool, e.target.checked)}
                    className={i === all.length - 1 && all.length % 2 === 1 ? 'sm:col-span-2' : undefined}
                  />
                ))}
              </div>
            </fieldset>

            {error && <Alert variant="error">{error}</Alert>}

            <div className="mt-auto flex flex-col-reverse gap-3 border-t border-code-blue-100 pt-6 sm:flex-row sm:justify-between">
              {onBack && (
                <Button variant="ghost" size="lg" disabled={saving} onClick={onBack}>Voltar</Button>
              )}
              <Button type="submit" size="lg" disabled={saving} className="sm:ml-auto">
                {saving ? 'Salvando…' : 'Começar as perguntas'}
                {!saving && <Icon icon={IconArrowRight} size={20} />}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </ParticipantShell>
  );
}
