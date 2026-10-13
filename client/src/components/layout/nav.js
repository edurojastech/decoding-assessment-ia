import {
  Activity, BarChart3, LayoutDashboard, Layers, Upload, User, Users,
} from 'lucide-react';

// Navegação do admin (specs/07-layout-dashboard.md). `path` relativo a /admin/empresas/:id.
export const COMPANY_PAGES = [
  { path: '', label: 'Painel da empresa', icon: LayoutDashboard },
  { path: 'participantes', label: 'Participantes', icon: User },
  { path: 'importar', label: 'Importar', icon: Upload },
  { path: 'diagnostico', label: 'Diagnóstico', icon: BarChart3 },
  { path: 'grupos', label: 'Grupos', icon: Layers },
  { path: 'turmas', label: 'Turmas', icon: Users },
];

export const OVERVIEW_PAGE = { label: 'Visão geral', icon: Activity };

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
