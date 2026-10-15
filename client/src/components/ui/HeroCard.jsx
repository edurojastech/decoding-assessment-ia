import { cx } from './cx.js';

// Hero escuro do dashboard (Mesh Escuro do DS, radius 24px). `aside` = bloco "Próximo passo" à direita.
export function HeroCard({ eyebrow, title, meta, actions, aside, className }) {
  return (
    <section
      aria-label={title}
      className={cx('grid gap-8 rounded-xl bg-mesh-dark p-6 text-canvas sm:p-8 lg:grid-cols-[minmax(0,1fr)_18.75rem]', className)}
    >
      <div className="flex min-w-0 flex-col gap-4">
        {eyebrow && <p className="text-label text-canvas/80">{eyebrow}</p>}
        <h2 className="text-[1.75rem] leading-tight font-bold sm:text-h2">{title}</h2>
        {meta && <div className="text-sm text-canvas/80">{meta}</div>}
        {actions && <div className="mt-2 flex flex-wrap gap-3">{actions}</div>}
      </div>
      {aside && (
        <div className="flex flex-col gap-3 border-t border-canvas/15 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <p className="text-label text-[0.625rem] text-pulse-lime">{aside.label ?? 'Próximo passo'}</p>
          <p className="text-h4">{aside.title}</p>
          {aside.text && <p className="text-sm text-canvas/80">{aside.text}</p>}
          {aside.action}
        </div>
      )}
    </section>
  );
}
