import { cx } from './ui/cx.js';

// Logos oficiais do DS (assets/brand → client/public/brand, redimensionados para 600px).
// SVG oficial ainda não disponível no DS.
const SOURCES = {
  onLight: '/brand/logos/logo-on-light.png',
  onDark: '/brand/logos/logo-on-dark.png',
};

export function Logo({ tone = 'onLight', className }) {
  return (
    <img
      src={SOURCES[tone]}
      alt="Decoding"
      className={cx('w-auto self-start', tone === 'onDark' ? 'h-10' : 'h-8', className)}
    />
  );
}
