import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../lib/api.js';
import { Alert, Badge, Card, CardBody, Progress } from '../../components/ui/index.js';

// RF-17 (base): lista as empresas com convidados, respondentes e cobertura.
// Os números macro (distribuição por nível) entram na Fatia D.
export default function Overview() {
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/companies').then(setCompanies).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-label text-code-blue/70">Visão geral</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Empresas</h1>
        <p className="mt-2 max-w-2xl text-code-blue/80">
          Acompanhe o preenchimento de cada empresa. Os resultados aparecem sempre como
          visão dos respondentes, junto com a cobertura.
        </p>
      </div>

      {error && <Alert variant="error" title="Não foi possível carregar as empresas">{error}</Alert>}

      {!companies && !error && <p role="status" className="text-sm text-code-blue/70">Carregando…</p>}

      {companies?.length === 0 && (
        <Card><CardBody><p>Nenhuma empresa cadastrada ainda.</p></CardBody></Card>
      )}

      {companies?.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <li key={company.id}>
              <Card variant="gradient" className="h-full transition-shadow duration-150 hover:shadow-lg">
                <CardBody className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl">{company.name}</h2>
                    <Badge variant={company.responded > 0 ? 'info' : 'default'}>
                      {company.responded > 0 ? 'Em andamento' : 'Sem respostas'}
                    </Badge>
                  </div>
                  <p className="text-sm text-code-blue/80">
                    {company.invited} convidados · {company.responded} respondentes
                  </p>
                  <Progress label="Cobertura" value={company.coverage} />
                  <Link
                    to={`/admin/empresas/${company.id}`}
                    state={{ name: company.name }}
                    className="mt-auto text-sm font-semibold text-code-blue underline decoration-insight decoration-2 underline-offset-4 hover:decoration-code-blue"
                  >
                    Abrir empresa
                    <span className="sr-only"> {company.name}</span> →
                  </Link>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
