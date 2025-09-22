// src/utils/validators.ts

// ✅ Valida formato básico de email (usuario@dominio.tld)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (v: string) => EMAIL_RE.test(v.trim());

// ✅ Contraseña fuerte: mínimo 8 caracteres, al menos una mayúscula, un número y un símbolo
const PASSWORD_RE = /^(?=.[A-Z])(?=.\d)(?=.[!@#$%^&]).{8,}$/;
export const isStrongPassword = (v: string) => PASSWORD_RE.test(v);

// ✅ Número de teléfono: solo dígitos, entre 8 y 15 caracteres
const PHONE_RE = /^\d{8,15}$/;
export const isValidPhone = (v: string) => PHONE_RE.test(v.trim());