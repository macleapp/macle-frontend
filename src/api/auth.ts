// src/api/auth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import api from '../config/api';                          // <- cliente axios único
import { saveTokens, clearTokens } from '../utils/authStorage';

type TokensResp = {
  ok: boolean;
  accessToken?: string;    // preferido
  token?: string;          // compat si el back envía "token"
  refreshToken?: string;
  user?: any;
  msg?: string;
};

/** Login con Google: obtiene idToken, lo envía al backend y guarda los tokens */
export async function loginWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const signRes = await GoogleSignin.signIn();
  let idToken: string | null | undefined = (signRes as any)?.idToken;

  // Fallback (Android)
  if (!idToken) {
    try {
      const t = await GoogleSignin.getTokens();
      idToken = (t as any)?.idToken;
    } catch {}
  }
  if (!idToken) throw new Error('No se pudo obtener idToken de Google');

  const { data } = await api.post<TokensResp>('/auth/google', { idToken });
  if (!data.ok) throw new Error(data.msg || 'Error al iniciar con Google');

  const accessToken = data.accessToken ?? data.token!;
  if (!accessToken || !data.refreshToken) throw new Error('Tokens no recibidos');

  await saveTokens({ accessToken, refreshToken: data.refreshToken });
  return data.user;
}

/** Login tradicional (email/contraseña) */
export async function login(email: string, password: string) {
  const { data } = await api.post<TokensResp>('/auth/login', { email, password });
  if (!data.ok) throw new Error(data.msg || 'Credenciales inválidas');

  const accessToken = data.accessToken ?? data.token!;
  if (!accessToken || !data.refreshToken) throw new Error('Tokens no recibidos');

  await saveTokens({ accessToken, refreshToken: data.refreshToken });
  return data.user;
}

/** Registro */
export async function register(payload: { email: string; password: string; role?: 'CUSTOMER'|'SELLER'|'PROVIDER' }) {
  const { data } = await api.post<TokensResp>('/auth/register', payload);
  if (!data.ok) throw new Error(data.msg || 'Registro falló');

  const accessToken = data.accessToken ?? data.token!;
  if (!accessToken || !data.refreshToken) throw new Error('Tokens no recibidos');

  await saveTokens({ accessToken, refreshToken: data.refreshToken });
  return data.user;
}

/** Cierre de sesión local (opcionalmente global en el backend) */
export async function logout({ global = false }: { global?: boolean } = {}) {
  if (global) {
    try { await api.post('/auth/logout-all'); } catch {}
  }
  await clearTokens();
}

/** Datos del usuario autenticado */
export async function me() {
  const { data } = await api.get('/auth/me');
  if (!data?.ok) throw new Error(data?.msg || 'No autorizado');
  return data.user;
}