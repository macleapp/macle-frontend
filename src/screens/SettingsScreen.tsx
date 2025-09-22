// src/screens/SettingsScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Switch, TouchableOpacity, Alert, Linking, Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { setLang } from "../../App";

const KEY_NOTIFS = "settings:notifs";
const KEY_THEME = "settings:theme"; // 'light' | 'dark' | 'system'
const KEY_LANG = "app:lang";        // 'es' | 'en'

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notifs, setNotifs] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [lang, setLangState] = useState<"es" | "en">("es");

  useEffect(() => {
    (async () => {
      const n = await AsyncStorage.getItem(KEY_NOTIFS);
      const t = await AsyncStorage.getItem(KEY_THEME);
      const l = await AsyncStorage.getItem(KEY_LANG);
      if (n !== null) setNotifs(n === "1");
      if (t === "light" || t === "dark" || t === "system") setTheme(t);
      if (l === "en" || l === "es") setLangState(l);
    })();
  }, []);

  async function toggleNotifs(v: boolean) {
    setNotifs(v);
    await AsyncStorage.setItem(KEY_NOTIFS, v ? "1" : "0");
    // aquí podrías registrar/unregister push
  }

  async function changeTheme(next: "light" | "dark" | "system") {
    setTheme(next);
    await AsyncStorage.setItem(KEY_THEME, next);
    // si usas theme provider, emite aquí
  }

  async function changeLang(next: "es" | "en") {
    setLangState(next);
    await setLang(next);
  }

  function currentThemeLabel() {
    if (theme === "system") return `Sistema (${Appearance.getColorScheme() || "light"})`;
    return theme === "light" ? "Claro" : "Oscuro";
    }

  async function logout() {
    // borra tokens y navega
    await AsyncStorage.multiRemove(["auth:token", "auth:refresh"]);
    Alert.alert("Sesión", "Cerraste sesión", [
      { text: "OK", onPress: () => navigation.reset({ index: 0, routes: [{ name: "AuthGate" as never }] }) },
    ]);
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 16 }}>Configuración</Text>

      {/* Notificaciones */}
      <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontWeight: "700", color: "#111827" }}>Notificaciones push</Text>
          <Switch value={notifs} onValueChange={toggleNotifs} />
        </View>
        <Text style={{ color: "#6b7280", marginTop: 6 }}>Avisos de mensajes, pedidos y reseñas.</Text>
      </View>

      {/* Idioma */}
      <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
        <Text style={{ fontWeight: "700", color: "#111827", marginBottom: 8 }}>Idioma</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => changeLang("es")}
            style={{
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb",
              backgroundColor: lang === "es" ? "#eef2ff" : "#fff", marginRight: 8,
            }}>
            <Text style={{ fontWeight: "700", color: "#111827" }}>Español</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeLang("en")}
            style={{
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb",
              backgroundColor: lang === "en" ? "#eef2ff" : "#fff",
            }}>
            <Text style={{ fontWeight: "700", color: "#111827" }}>English</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tema */}
      <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
        <Text style={{ fontWeight: "700", color: "#111827", marginBottom: 8 }}>Tema</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {(["system", "light", "dark"] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => changeTheme(opt)}
              style={{
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb",
                backgroundColor: theme === opt ? "#eef2ff" : "#fff", marginRight: 8, marginBottom: 8,
              }}>
              <Text style={{ fontWeight: "700", color: "#111827" }}>
                {opt === "system" ? currentThemeLabel() : opt === "light" ? "Claro" : "Oscuro"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Ayuda */}
      <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
        <Text style={{ fontWeight: "700", color: "#111827", marginBottom: 8 }}>Ayuda</Text>
        <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/50499998888")}>
          <Text style={{ color: "#2563eb", fontWeight: "700" }}>Soporte por WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Cuenta */}
      <View style={{ paddingVertical: 12 }}>
        <Text style={{ fontWeight: "700", color: "#111827", marginBottom: 8 }}>Cuenta</Text>
        <TouchableOpacity
          onPress={logout}
          style={{ backgroundColor: "#ef4444", paddingVertical: 12, borderRadius: 10, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ marginTop: 24, color: "#9ca3af" }}>Versión 1.0.0</Text>
    </View>
  );
}