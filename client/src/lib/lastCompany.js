// Conveniência (specs/07): lembra a última empresa aberta neste navegador.
// A empresa selecionada vale pela URL (/admin/empresas/:id); isto só preenche o seletor fora dela.
const KEY = 'decoding.assessment.lastCompany';

export function readLastCompany() {
  try {
    const value = Number(localStorage.getItem(KEY));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function saveLastCompany(id) {
  try {
    if (id) localStorage.setItem(KEY, String(id));
    else localStorage.removeItem(KEY);
  } catch {
    // Sem armazenamento (aba anônima, bloqueio): segue sem lembrar.
  }
}
