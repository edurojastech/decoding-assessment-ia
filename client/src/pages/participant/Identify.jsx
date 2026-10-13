import { useState } from 'react';
import { api } from '../../lib/api.js';
import { ParticipantShell } from '../../components/ParticipantShell.jsx';
import { Alert, Button, Card, CardBody, Input, Select } from '../../components/ui/index.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// RF-09: confere e corrige a identificação que veio da importação.
export default function Identify({ token, participant, questionnaire, onConfirmed }) {
  const [form, setForm] = useState({ name: participant.name, email: participant.email, area: participant.area });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // P0a: lista do original; mantém a área importada se ela não estiver na lista.
  const areaOptions = questionnaire.profile.find((p) => p.id === 'P0a').options;
  const areas = areaOptions.includes(participant.area) ? areaOptions : [participant.area, ...areaOptions];

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Informe seu nome.';
    if (!EMAIL.test(form.email.trim())) next.email = 'Informe um e-mail válido.';
    if (!form.area) next.area = 'Selecione sua área.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    setSaving(true);
    try {
      const { participant: updated } = await api.patch(`/r/${token}`, form);
      onConfirmed(updated);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <ParticipantShell>
      <p className="text-label text-code-blue/70">Identificação</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Confira seus dados</h1>
      <p className="mt-3 text-code-blue/80">
        Estes dados vieram da {participant.companyName}. Se algo estiver diferente, corrija antes de seguir.
      </p>

      <Card className="mt-8">
        <CardBody className="sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Input label="Nome" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
            <Input
              label="E-mail" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email}
            />
            <Select label="Área" value={form.area} onChange={set('area')} error={errors.area}>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>

            {error && <Alert variant="error">{error}</Alert>}

            <Button type="submit" size="lg" disabled={saving} className="mt-2 w-full sm:w-auto sm:self-start">
              {saving ? 'Salvando…' : 'Confirmar e continuar'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </ParticipantShell>
  );
}
