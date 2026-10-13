import {
  IconActivity, IconChartBar, IconLayoutDashboard, IconStack2, IconUpload, IconUser, IconUsers,
} from '@tabler/icons-react';

// Navegação do admin (specs/07-layout-dashboard.md). `path` relativo a /admin/empresas/:id.
// Ícones: Tabler, como no DS (design-system-decoding.vercel.app/icones).
export const COMPANY_PAGES = [
  { path: '', label: 'Painel da empresa', icon: IconLayoutDashboard },
  { path: 'participantes', label: 'Participantes', icon: IconUser },
  { path: 'importar', label: 'Importar', icon: IconUpload },
  { path: 'diagnostico', label: 'Diagnóstico', icon: IconChartBar },
  { path: 'grupos', label: 'Grupos', icon: IconStack2 },
  { path: 'turmas', label: 'Turmas', icon: IconUsers },
];

export const OVERVIEW_PAGE = { label: 'Visão geral', icon: IconActivity };

export const companyPath = (id, path = '') => `/admin/empresas/${id}${path ? `/${path}` : ''}`;

// Rótulo da página atual para o breadcrumb.
export function pageLabel(pathname) {
  const match = pathname.match(/^\/admin\/empresas\/[^/]+\/?([^/]*)/);
  if (!match) return OVERVIEW_PAGE.label;
  return COMPANY_PAGES.find((p) => p.path === match[1])?.label ?? OVERVIEW_PAGE.label;
}

// Eyebrow padrão: "OUTUBRO 2026 · ASSESSMENT DE IA" (o uppercase vem do text-label).
export function monthLabel(date = new Date()) {
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  return `${month} ${date.getFullYear()}`;
}
