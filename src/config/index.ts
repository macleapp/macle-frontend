// src/config/index.ts

// 🧭 URL base del backend
// - En desarrollo (emulador Android) usa 10.0.2.2:3000/api
// - En producción usa Render con /api al final
export const API_BASE_URL = __DEV__
  ? "http://10.0.2.2:3000/api"
  : "https://macle-api.onrender.com/api";

// 🛣️ Rutas del API (relativas a API_BASE_URL)
export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    verifyEmail: "/auth/verify-email",          // GET /auth/verify-email/:token (se concatena el token)
    resendVerification: "/auth/resend-verification",
  },
  onboarding: {
    status: "/welcome/status",
    complete: "/welcome/complete",
    seller: "/onboarding/seller",
    provider: "/onboarding/provider",
  },
  products: {
    list: "/products",
  },
};