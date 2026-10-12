import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { Logo } from '../../components/Logo.jsx';
import { Footer } from '../../components/Footer.jsx';
import { Alert, Button, Card, CardBody, Input } from '../../components/ui/index.js';

// RF-01 (login do Administrador) e RF-19 (credenciais demo visíveis na tela de login).
export default function Login() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demo, setDemo] = useState(null);

  useEffect(() => {
    api.get('/auth/demo').then((d) => d.demo && setDemo(d)).catch(() => {});
  }, []);

  if (status === 'authenticated') {
    return <Navigate to={location.state?.from || '/admin'} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="grid flex-1 lg:grid-cols-2">
        <section className="bg-mesh-dark flex flex-col justify-between gap-10 px-6 py-10 text-canvas sm:px-12 lg:py-16">
          <Logo tone="onDark" />
          <div className="max-w-md">
            <p className="text-label text-insight">Assessment de Maturidade em IA</p>
            <h1 className="mt-4 text-3xl leading-tight sm:text-5xl">
              Decodifique o potencial em IA do time.
            </h1>
            <p className="mt-4 text-base text-canvas/80 sm:text-lg">
              Maturidade individual, visão da organização e turmas por nível.
            </p>
          </div>
          <p className="text-label text-pulse-lime">IA First. Human Driven.</p>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <Card className="w-full max-w-md">
            <CardBody className="flex flex-col gap-6 sm:p-8">
              <div>
                <p className="text-label text-code-blue/70">Acesso Decoding</p>
                <h2 className="mt-2 text-2xl">Entrar no painel</h2>
              </div>

              {demo && (
                <Alert variant="info" title="Ambiente de demonstração">
                  <p>Use estas credenciais para entrar:</p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    <dt className="font-semibold">E-mail</dt>
                    <dd className="break-all font-mono">{demo.email}</dd>
                    <dt className="font-semibold">Senha</dt>
                    <dd className="break-all font-mono">{demo.password}</dd>
                  </dl>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => { setEmail(demo.email); setPassword(demo.password); }}
                  >
                    Preencher com dados de demonstração
                  </Button>
                </Alert>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <Input
                  label="E-mail"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Senha"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <Alert variant="error">{error}</Alert>}
                <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full">
                  {submitting ? 'Entrando…' : 'Entrar'}
                </Button>
              </form>
            </CardBody>
          </Card>
        </section>
      </div>
      <Footer />
    </div>
  );
}
