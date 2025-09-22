
// src/config/api.ts
import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./index";          // -> mismo folder: src/config/index.ts
import { getToken } from "../utils/storage";     // -> ajusta la ruta si tu helper está en otro lugar

const api = axios.create({ baseURL: API_BASE_URL });

// Adjunta el Bearer token si existe
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getToken?.(); // si no tienes getToken, borra este bloque try por completo
      if (token) {
        const h = (config.headers ?? new AxiosHeaders()) as AxiosHeaders;
        h.set("Authorization", `Bearer ${token}`);
        config.headers = h;
      }
    } catch {}
    return config;
  }
);

export default api;