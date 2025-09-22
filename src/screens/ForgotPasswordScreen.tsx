// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { resetPassword } from "../services/authService";
import { FirebaseError } from "firebase/app";

const COLORS = {
  blue: "#1e88e5",
  white: "#ffffff",
  black: "#111111",
  gray: "#6b7280",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: "700", color: COLORS.black },
  subtitle: { fontSize: 14, color: COLORS.gray },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 10 }),
    color: COLORS.black,
  },
  btn: {
    backgroundColor: COLORS.blue,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0b4a91",
  },
  btnTxt: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
  msgOk: { color: "#059669", fontSize: 13 },
  msgErr: { color: "#b91c1c", fontSize: 13 },
});

function mapFirebaseError(e: unknown): string {
  const err = e as FirebaseError;
  switch (err?.code) {
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/user-not-found":
      // Por privacidad, respondemos como éxito igualmente.
      return "Si el correo existe, te enviaremos instrucciones.";
    case "auth/network-request-failed":
      return "Sin conexión. Inténtalo de nuevo.";
    default:
      return err?.message || "Ocurrió un error. Intenta de nuevo.";
  }
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const onSubmit = async () => {
    const em = email.trim();
    if (!em || !EMAIL_RE.test(em) || busy) {
      if (!EMAIL_RE.test(em)) {
        setErrMsg("Ingresa un correo válido.");
        setTimeout(() => setErrMsg(""), 3000);
      }
      return;
    }

    setBusy(true);
    setOkMsg("");
    setErrMsg("");

    try {
      await resetPassword(em);
      setOkMsg("Si el correo existe, te enviaremos instrucciones.");
      setTimeout(() => setOkMsg(""), 3000);
    } catch (e) {
      setErrMsg(mapFirebaseError(e));
      setTimeout(() => setErrMsg(""), 3000);
    } finally {
      setBusy(false);
    }
  };

  const disabled = !email.trim() || busy;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.card}>
        <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
        <Text style={styles.subtitle}>
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </Text>

        <TextInput
          placeholder="tu@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        {!!okMsg && <Text style={styles.msgOk}>{okMsg}</Text>}
        {!!errMsg && <Text style={styles.msgErr}>{errMsg}</Text>}

        <TouchableOpacity
          onPress={onSubmit}
          disabled={disabled}
          style={[styles.btn, disabled && { opacity: 0.6 }]}
        >
          <Text style={styles.btnTxt}>{busy ? "Enviando…" : "Enviar"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}