// src/services/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  applyActionCode,
  onAuthStateChanged,
  getIdToken,
  type User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebaseClient";

// Tipos de roles disponibles
export type Role = "CUSTOMER" | "SELLER" | "PROVIDER";

// =====================
//   AUTH BÁSICO
// =====================

// REGISTER: crea usuario en Auth, setea displayName, guarda perfil en Firestore
export async function register(
  name: string,
  email: string,
  password: string,
  accepted: boolean,
  role: Role = "CUSTOMER"
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  // nombre visible en Firebase Auth
  await updateProfile(user, { displayName: name });

  // guardar perfil mínimo en Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email: user.email,
    role,
    accepted,
    provider: "password",
    emailVerified: user.emailVerified,
    createdAt: serverTimestamp(),
  });

  // enviar verificación
  await sendEmailVerification(user);

  return { ok: true, uid: user.uid };
}

// LOGIN: devuelve user + idToken por si tu backend lo necesita
export async function login(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;
  const token = await getIdToken(user, true);
  return { ok: true, user, token };
}

// ME: user actual (si necesitas el token, puedes pedirlo aquí también)
export async function me() {
  const user = auth.currentUser;
  if (!user) return { ok: false, user: null };
  const token = await getIdToken(user, false);
  return { ok: true, user, token };
}

// =====================
//   VERIFICACIÓN EMAIL
// =====================

// Reenviar verificación al usuario logueado (se ignora el email si no coincide)
export async function resendVerification(_email?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay una sesión activa.");
  await sendEmailVerification(user);
  return { ok: true, msg: "Correo de verificación enviado." };
}

// Confirmar verificación desde un enlace (oobCode) de Firebase
export async function verifyEmail(oobCode: string) {
  await applyActionCode(auth, oobCode);
  return { ok: true, msg: "Correo verificado." };
}

// =====================
//   RESET PASSWORD
// =====================

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
  return { ok: true, msg: "Te enviamos un correo para restablecer tu contraseña." };
}

// =====================
//   LOGOUT
// =====================

export async function logout() {
  await signOut(auth);
  return { ok: true };
}

// =====================
//   OBSERVADOR DE SESIÓN
// =====================

export function listenAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}