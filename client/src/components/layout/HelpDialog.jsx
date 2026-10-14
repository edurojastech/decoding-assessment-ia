import { useEffect, useRef } from 'react';
import { IconX } from '@tabler/icons-react';
import { Icon } from '../ui/Icon.jsx';
import { Button } from '../ui/index.js';

const LEVELS = [
  ['Iniciante', 'até 25'],
  ['Básico', '26 a 50'],
  ['Intermediário', '51 a 75'],
  ['Avançado', 'acima de 75'],
];

// Ajuda curta da topbar: como ler níveis e cobertura (specs/04-pontuacao.md).
export function HelpDialog({ onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-code-blue/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ajuda-titulo"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-canvas p-6 shadow-lg sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-label text-code-blue-300">Ajuda</p>
            <h2 id="ajuda-titulo" className="mt-2 text-h3">Como ler o assessment</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="rounded-full p-1 hover:bg-code-blue-50">
            <Icon icon={IconX} className="h-5 w-5" />
            <span className="sr-only">Fechar ajuda</span>
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-4 text-sm">
          <section className="flex flex-col gap-2">
            <h3 className="text-label">Níveis</h3>
            <p>Cada pessoa recebe um nível pela pontuação geral, de 0 a 100, calculada no servidor a partir das respostas:</p>
            <ul className="grid grid-cols-2 gap-2">
              {LEVELS.map(([level, range]) => (
                <li key={level} className="rounded-lg bg-surface px-3 py-2"><strong>{level}</strong> · {range}</li>
              ))}
            </ul>
            <p className="text-code-blue/70">
              Quem responde menos de 70% do questionário fica com preenchimento incompleto, sem nível.
            </p>
          </section>
          <section className="flex flex-col gap-2">
            <h3 className="text-label">Cobertura</h3>
            <p>
              Cobertura é quantas pessoas concluíram sobre quantas foram convidadas. Os resultados da empresa
              descrevem só quem respondeu: são a visão dos respondentes, não uma nota da empresa.
            </p>
          </section>
        </div>
        <Button className="mt-6" onClick={onClose}>Entendi</Button>
      </div>
    </div>
  );
}
