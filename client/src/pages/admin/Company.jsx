import { Link, useLocation } from 'react-router';
import { Card, CardBody } from '../../components/ui/index.js';

// Placeholder da Fase 3. Abas Participantes · Importar · Diagnóstico · Grupos · Turmas
// chegam nas Fatias C e D.
export default function Company() {
  const { state } = useLocation();

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin" className="text-sm font-semibold text-code-blue/80 hover:text-code-blue">← Empresas</Link>
      <div>
        <p className="text-label text-code-blue/70">Empresa</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{state?.name ?? 'Empresa'}</h1>
      </div>
      <Card>
        <CardBody>
          <p className="text-code-blue/80">
            Participantes, importação, diagnóstico, grupos e turmas desta empresa estão em construção.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
