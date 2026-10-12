import { Link } from 'react-router';
import { Logo } from '../components/Logo.jsx';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <h1 className="text-3xl">Página não encontrada</h1>
      <p className="text-code-blue/80">
        Confira o endereço. Se você recebeu um link pessoal, abra-o exatamente como foi enviado.
      </p>
      <Link to="/admin" className="text-sm font-semibold underline decoration-insight decoration-2 underline-offset-4">
        Ir para o painel
      </Link>
    </main>
  );
}
