// src/services/auth.ts
import api from "../config/api";               // tu instancia de axios (baseURL = API_BASE_URL)
import { API_ROUTES } from "../config";

type LoginResp = { token: string; user: any };
type RegisterResp = { ok: boolean; user?: any };

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResp>(API_ROUTES.auth.login, {
    email,
    password,
  });
  return data; // { token, user }
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post<RegisterResp>(API_ROUTES.auth.register, {
    name,
    email,
    password,
  });
  return data;
}

export async function me() {
  const { data } = await api.get(API_ROUTES.auth.me);
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post(API_ROUTES.auth.forgotPassword, { email });
  return data;
}