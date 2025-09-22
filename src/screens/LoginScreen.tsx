// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { login, resendVerification, logout } from "../services/authService";
import { setToken, setUser } from "../utils/storage";
import axios from "axios";

// Google + Firebase
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  type User as GoogleUser,
} from "@react-native-google-signin/google-signin";
import { auth, db } from "../lib/firebaseClient";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const COLORS = {
  primary: "#1506e6ff",
  bg: "#FFFFFF",
  text: "#111111",
  subtext: "#666666",
  border: "#E0E0E0",
};

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);

  const canSubmit = Boolean(email.trim() && password.trim());

  const onLogin = async () => {
    if (!canSubmit || busy) return;
    try {
      setBusy(true);
      setNeedsVerify(false);

      // authService.login -> Firebase signIn + idToken
      const resp = await login(email.trim(), password);

      // Si el correo no está verificado, reenviamos y cerramos sesión
      if (!resp.user.emailVerified) {
        setNeedsVerify(true);
        try {
          await resendVerification();
        } catch {}
        await logout();
        Alert.alert(
          "Verificación pendiente",
          "Te enviamos un correo para verificar tu cuenta. Revisa tu bandeja de entrada."
        );
        return;
      }

      // Guarda sesión local (si tu app lo usa para hablar con tu backend)
      if (resp.token) await setToken(resp.token);
      await setUser({
        uid: resp.user.uid,
        email: resp.user.email,
        displayName: resp.user.displayName,
        emailVerified: resp.user.emailVerified,
      });

      navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });
    } catch (err: any) {
      const serverData = err?.response?.data;
      let msg = "No se pudo iniciar sesión.";
      if (axios.isAxiosError(err)) msg = serverData?.msg || serverData?.error || err.message;
      else if (err instanceof Error) msg = err.message;

      if (typeof msg === "string" && msg.toLowerCase().includes("verific")) setNeedsVerify(true);
      Alert.alert("Login", msg);
    } finally {
      setBusy(false);
    }
  };

  // Garantiza el documento del usuario en Firestore al entrar con Google
  const ensureUserDoc = async (u: { uid: string; email: string | null; displayName: string | null }) => {
    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: u.uid,
        email: u.email,
        name: u.displayName ?? "",
        role: "CUSTOMER",
        provider: "google",
        emailVerified: true,
        createdAt: serverTimestamp(),
      });
    }
  };

  // ---- Google Sign-In + Firebase ----
  const onGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const res = (await GoogleSignin.signIn()) as unknown as GoogleUser | null;
      if (!res) return; // cancelado

      const { idToken } = res;
      if (!idToken) {
        Alert.alert("Google", "No se recibió idToken.");
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const { user } = await signInWithCredential(auth, credential);

      // crea doc si falta
      await ensureUserDoc({ uid: user.uid, email: user.email, displayName: user.displayName });

      // token para backend si lo necesitas
      const token = await user.getIdToken(true);
      await setToken(token);
      await setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
      });

      navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) return;
      console.log("❌ Google login error", error);
      Alert.alert("Google", error?.message ?? "No se pudo iniciar sesión con Google");
    }
  };

  const onResendVerification = async () => {
    try {
      await resendVerification();
      Alert.alert("Verificación", "Te enviamos un nuevo correo de verificación.");
    } catch (err: any) {
      const serverData = err?.response?.data;
      const msg =
        serverData?.msg || serverData?.error || err?.message || "Error al reenviar verificación";
      Alert.alert("Verificación", msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.brand}>MACLE</Text>
          <Text style={styles.subtitle}>Conecta con emprendedores reales</Text>

          <View style={styles.inputRow}>
            <Feather name="mail" size={18} color={COLORS.subtext} />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              placeholderTextColor={COLORS.subtext}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputRow}>
            <Feather name="lock" size={18} color={COLORS.subtext} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.subtext}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            onPress={onLogin}
            disabled={!canSubmit || busy}
            style={[styles.btn, (!canSubmit || busy) && { opacity: 0.6 }]}
          >
            <Text style={styles.btnTxt}>{busy ? "Entrando..." : "Entrar"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkAlt}>
              ¿No tienes cuenta?{" "}
              <Text style={{ color: COLORS.primary, fontWeight: "700" }}>Regístrate</Text>
            </Text>
          </TouchableOpacity>

          {needsVerify && (
            <TouchableOpacity onPress={onResendVerification}>
              <Text style={[styles.link, { marginTop: 8 }]}>Reenviar correo de verificación</Text>
            </TouchableOpacity>
          )}

          <GoogleSigninButton
            style={{ width: "100%", height: 48, marginTop: 16 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={onGoogleLogin}
          />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  brand: { fontSize: 28, fontWeight: "900", color: COLORS.text, textAlign: "center" },
  subtitle: { color: COLORS.subtext, textAlign: "center", marginTop: 4, marginBottom: 16 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  input: { flex: 1, color: COLORS.text },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  btnTxt: { color: "#fff", fontWeight: "800" },
  link: { color: COLORS.primary, textAlign: "center", marginTop: 12, fontWeight: "700" },
  linkAlt: { color: COLORS.text, textAlign: "center", marginTop: 10, fontWeight: "600" },
});