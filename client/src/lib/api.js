export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const NETWORK_ERROR = 'Algo deu errado. Verifique sua conexão e tente novamente.';

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(NETWORK_ERROR, 0);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error || NETWORK_ERROR, res.status);
  return data;
}

// Baixa um arquivo da API (CSV de links, modelo de importação) com o nome enviado pelo servidor.
async function download(path, fallbackName) {
  let res;
  try {
    res = await fetch(`/api${path}`, { credentials: 'include' });
  } catch {
    throw new ApiError(NETWORK_ERROR, 0);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(data?.error || NETWORK_ERROR, res.status);
  }
  const name = res.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] || fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  download,
};
