import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import { api } from './api.js';

const AuthContext = createContext(null);

// Sessão do Administrador da Decoding (RF-01). Envolve só as rotas /admin.
export function AuthProvider() {
  const [state, setState] = useState({ status: 'loading', user: null });

  useEffect(() => {
    let active = true;
    api.get('/auth/me')
      .then(({ user }) => active && setState({ status: 'authenticated', user }))
      .catch(() => active && setState({ status: 'anonymous', user: null }));
    return () => { active = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    const { user } = await api.post('/auth/login', { email, password });
    setState({ status: 'authenticated', user });
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    setState({ status: 'anonymous', user: null });
  }, []);

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);
  return (
    <AuthContext.Provider value={value}>
      <Outlet />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
