import { useState } from 'react';
import { IconArrowRight, IconBriefcase, IconPencil, IconSparkles, IconUser } from '@tabler/icons-react';
import { api } from '../../lib/api.js';
import { ParticipantShell } from '../../components/ParticipantShell.jsx';
import { Alert, Button, Icon, Input, Select, ToggleChip } from '../../components/ui/index.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NONE_TOOL = 'Nenhuma';

function SectionHeading({ icon, title, children }) {
  return (
    <div className="flex gap-3">
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-insight-50 text-insight-700">
        <Icon icon={icon} size={22} />
      </span>
      <div>
        <h2 className="text-lg leading-snug font-bold tracking-normal">{title}</h2>
        {children && <p className="text-sm text-code-blue/70">{children}</p>}
      </div>
    </div>
  );
}

// RF-09 + perguntas de perfil (RF-10, P0a–P0c) numa única etapa "Seu perfil":
// a identificação importada aparece em modo leitura (com "Editar"), seguida da função e das ferramentas.
// O perfil contextualiza o diagnóstico e não pontua (RN-12).
export default function Identify({ token, participant, questionnaire, onConfirmed }) {
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
    <ParticipantShell wide step="profile">
      <div className="flex flex-col gap-3">
        <p className="text-label text-code-blue/70">Antes das perguntas</p>
        <h1 className="text-3xl sm:text-h2">Complete seu perfil</h1>
        <p className="max-w-2xl text-lg text-code-blue/80">
          Estas informações ajudam a contextualizar o diagnóstico e não entram na pontuação.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Coluna 1 · Seus dados + função */}
          <div className="flex flex-col gap-10">
            <section aria-labelledby="dados-titulo" className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <SectionHeading icon={IconUser} title={<span id="dados-titulo">Seus dados</span>}>
                  Vieram da {participant.companyName}. Se algo estiver diferente, corrija antes de seguir.
                </SectionHeading>
                {!editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-sm font-semibold text-code-blue-700 underline underline-offset-4"
                  >
                    <Icon icon={IconPencil} size={16} />
                    Editar
                  </button>
                )}
              </div>

              {editing ? (
                <div className="flex flex-col gap-5">
                  <Input label="Nome" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
                  <Input
                    label="E-mail" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email}
                  />
                  <Select label="Área" value={form.area} onChange={set('area')} error={errors.area}>
                    {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                  </Select>
                </div>
              ) : (
                <dl className="flex flex-col">
                  {readRows.map((r) => (
                    <div key={r.label} className="flex flex-col gap-0.5 border-b border-code-blue-100 py-3 first:pt-0">
                      <dt className="text-xs text-code-blue/70">{r.label}</dt>
                      <dd className="break-words">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            <section aria-labelledby="funcao-titulo" className="flex flex-col gap-4">
              <SectionHeading icon={IconBriefcase} title={<span id="funcao-titulo">Sua função</span>}>
                Opcional. Só contextualiza a sua devolutiva.
              </SectionHeading>
              <Input
                aria-labelledby="funcao-titulo"
                placeholder="Ex.: Analista financeiro"
                maxLength={120}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </section>
          </div>

          {/* Coluna 2 · Ferramentas de IA (P0c) */}
          <fieldset className="flex flex-col gap-5 lg:border-l lg:border-code-blue-100 lg:pl-16">
            <legend className="sr-only">{profile.P0c.text}</legend>
            <SectionHeading icon={IconSparkles} title={profile.P0c.text}>Marque todas as que se aplicam.</SectionHeading>
            <div className="flex flex-wrap gap-3">
              {profile.P0c.options.map((tool) => (
                <ToggleChip
                  key={tool}
                  name="tools"
                  value={tool}
                  checked={tools.includes(tool)}
                  onChange={(e) => toggleTool(tool, e.target.checked)}
                >
                  {tool}
                </ToggleChip>
              ))}
            </div>
          </fieldset>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex flex-col gap-3 border-t border-code-blue-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-code-blue/70">Próximo passo: {questionnaire.dimensions.length} dimensões, uma de cada vez.</p>
          <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Salvando…' : 'Começar as perguntas'}
            {!saving && <Icon icon={IconArrowRight} size={20} />}
          </Button>
        </div>
      </form>
    </ParticipantShell>
  );
}
