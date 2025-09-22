// src/screens/RegisterScreen.tsx
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  ScrollView,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { register } from "../services/authService";
import { FirebaseError } from "firebase/app";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (v: string) => EMAIL_RE.test(v.trim());
const isValidPassword = (pass: string) => pass.length >= 8;

const PRIVACY_URL = "https://legal.macleapp.com/privacy.html";
const TERMS_URL = "https://legal.macleapp.com/terms.html";

const COLORS = {
  primary: "#1506e6ff",
  bg: "#FFFFFF",
  text: "#111111",
  subtext: "#666666",
  border: "#E0E0E0",
};

async function openUrl(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert("No se puede abrir el enlace", url);
  } catch (e) {
    Alert.alert("Error al abrir el enlace", (e as Error).message);
  }
}

function mapFirebaseError(e: unknown): string {
  const err = e as FirebaseError & { code?: string; message?: string };
  switch (err?.code) {
    case "auth/email-already-in-use":
      return "Este correo ya está registrado.";
    case "auth/invalid-email":
      return "El formato del correo no es válido.";
    case "auth/weak-password":
      return "La contraseña es muy débil.";
    case "auth/network-request-failed":
      return "Sin conexión. Inténtalo de nuevo.";
    default:
      return err?.message || "No se pudo crear la cuenta.";
  }
}

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPass1, setTouchedPass1] = useState(false);
  const [touchedPass2, setTouchedPass2] = useState(false);

  const canSubmit = useMemo(() => {
    if (!name.trim() || !email.trim() || !pass1.trim() || !pass2.trim()) return false;
    if (!isValidEmail(email)) return false;
    if (!isValidPassword(pass1)) return false;
    if (pass1 !== pass2) return false;
    if (!accepted) return false;
    return true;
  }, [name, email, pass1, pass2, accepted]);

  const onRegister = async () => {
    if (busy || !canSubmit) return;
    try {
      setBusy(true);
      await register(name.trim(), email.trim(), pass1, accepted);
      Alert.alert(
        "Registro",
        "Cuenta creada. Te enviamos un correo de verificación. Revisa tu bandeja de entrada."
      );
      navigation.replace("Login");
    } catch (e) {
      Alert.alert("Registro", mapFirebaseError(e));
    } finally {
      setBusy(false);
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
          <Text style={styles.title}>Crear cuenta</Text>

          <View style={styles.inputRow}>
            <Feather name="user" size={18} color={COLORS.subtext} />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={COLORS.subtext}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

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
              onBlur={() => setTouchedEmail(true)}
              returnKeyType="next"
            />
          </View>
          {touchedEmail && !isValidEmail(email) && (
            <Text style={styles.errorTxt}>Ingresa un correo válido</Text>
          )}

          <View style={styles.inputRow}>
            <Feather name="lock" size={18} color={COLORS.subtext} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña (mín. 8)"
              placeholderTextColor={COLORS.subtext}
              secureTextEntry
              value={pass1}
              onChangeText={setPass1}
              onBlur={() => setTouchedPass1(true)}
              returnKeyType="next"
            />
          </View>
          {touchedPass1 && pass1.length > 0 && !isValidPassword(pass1) && (
            <Text style={styles.errorTxt}>La contraseña debe tener al menos 8 caracteres</Text>
          )}

          <View style={styles.inputRow}>
            <Feather name="lock" size={18} color={COLORS.subtext} />
            <TextInput
              style={styles.input}
              placeholder="Repetir contraseña"
              placeholderTextColor={COLORS.subtext}
              secureTextEntry
              value={pass2}
              onChangeText={setPass2}
              onBlur={() => setTouchedPass2(true)}
              returnKeyType="done"
            />
          </View>
          {touchedPass2 && pass2.length > 0 && pass1 !== pass2 && (
            <Text style={styles.errorTxt}>Las contraseñas no coinciden</Text>
          )}

          {/* Casilla legal */}
          <View style={styles.legalRow}>
            <TouchableOpacity
              onPress={() => setAccepted((v) => !v)}
              activeOpacity={0.8}
              style={[styles.checkbox, accepted && styles.checkboxOn]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
            >
              {accepted && <Feather name="check" size={14} color="#fff" />}
            </TouchableOpacity>

            <Text style={styles.legalText}>
              Acepto la{" "}
              <Text style={styles.linkInline} onPress={() => openUrl(PRIVACY_URL)}>
                Política de Privacidad
              </Text>{" "}
              y los{" "}
              <Text style={styles.linkInline} onPress={() => openUrl(TERMS_URL)}>
                Términos
              </Text>
              .
            </Text>
          </View>

          <TouchableOpacity
            onPress={onRegister}
            disabled={!canSubmit || busy}
            style={[styles.btn, (!canSubmit || busy) && { opacity: 0.6 }]}
          >
            <Text style={styles.btnTxt}>{busy ? "Creando..." : "Crear cuenta"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace("Login")}>
            <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },
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
  errorTxt: { color: "red", marginTop: 6 },

  legalRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, marginBottom: 6 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  legalText: { flex: 1, color: COLORS.subtext },
  linkInline: { color: COLORS.primary, fontWeight: "700" },

  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnTxt: { color: "#fff", fontWeight: "800" },
  link: { color: COLORS.primary, textAlign: "center", marginTop: 12, fontWeight: "600" },
});