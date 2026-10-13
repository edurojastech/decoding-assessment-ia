const COPY_ERROR = 'Não foi possível copiar. Selecione o texto e copie manualmente.';

// Fallback para http sem contexto seguro ou quando o navegador recusa a Clipboard API.
function legacyCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } finally {
    area.remove();
  }
  return ok;
}

// Copia texto para a área de transferência.
export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // segue para o fallback
    }
  }
  if (!legacyCopy(text)) throw new Error(COPY_ERROR);
}
