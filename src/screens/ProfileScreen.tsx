// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
// Si luego quieres persistir los switches entre aperturas:
// import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
  primary: "#1506e6ff",
  bg: "#ffffff",
  text: "#111827",
  subtext: "#6b7280",
  border: "#00000033",
};

export default function ProfileScreen() {
  const [role, setRole] = useState<"Cliente" | "Emprendedor">("Cliente");

  // Preferencias del emprendedor
  const [offersServices, setOffersServices] = useState(true);
  const [offersProducts, setOffersProducts] = useState(false);

  const toggleRole = () => {
    setRole(prev => (prev === "Cliente" ? "Emprendedor" : "Cliente"));
  };

  const logout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => console.log("Logout") },
    ]);
  };

  // Si quieres persistir localmente, descomenta:
  // useEffect(() => {
  //   (async () => {
  //     const savedRole = await AsyncStorage.getItem("@macle/role");
  //     const s = await AsyncStorage.getItem("@macle/offersServices");
  //     const p = await AsyncStorage.getItem("@macle/offersProducts");
  //     if (savedRole) setRole(savedRole as any);
  //     if (s !== null) setOffersServices(s === "1");
  //     if (p !== null) setOffersProducts(p === "1");
  //   })();
  // }, []);
  // useEffect(() => {
  //   AsyncStorage.setItem("@macle/role", role);
  //   AsyncStorage.setItem("@macle/offersServices", offersServices ? "1" : "0");
  //   AsyncStorage.setItem("@macle/offersProducts", offersProducts ? "1" : "0");
  // }, [role, offersServices, offersProducts]);

  return (
    <ScrollView style={styles.safe} contentContainerStyle={{ padding: 16 }}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=300&auto=format&fit=crop",
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>María López</Text>
          <Text style={styles.email}>maria@email.com</Text>
        </View>
        <TouchableOpacity onPress={toggleRole} style={styles.roleBtn}>
          <Text style={styles.roleTxt}>{role}</Text>
        </TouchableOpacity>
      </View>

      {/* Opciones comunes */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <Feather name="edit" size={18} color={COLORS.text} />
          <Text style={styles.rowTxt}>Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Feather name="settings" size={18} color={COLORS.text} />
          <Text style={styles.rowTxt}>Configuración</Text>
        </TouchableOpacity>
      </View>

      {/* Preferencias del emprendedor */}
      {role === "Emprendedor" && (
        <>
          <View style={[styles.section, { marginTop: 16 }]}>
            <View style={styles.prefHeader}>
              <Feather name="briefcase" size={18} color={COLORS.text} />
              <Text style={[styles.rowTxt, { fontWeight: "700" }]}>
                ¿Qué ofreces en MACLE?
              </Text>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabels}>
                <Text style={styles.switchTitle}>Servicios</Text>
                <Text style={styles.switchHint}>
                  Agenda, citas, trabajos por hora o por proyecto.
                </Text>
              </View>
              <Switch
                value={offersServices}
                onValueChange={setOffersServices}
                trackColor={{ false: "#bbb", true: COLORS.primary }}
                thumbColor={"#fff"}
              />
            </View>

            <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <View style={styles.switchLabels}>
                <Text style={styles.switchTitle}>Productos</Text>
                <Text style={styles.switchHint}>
                  Catálogo, inventario básico y publicaciones.
                </Text>
              </View>
              <Switch
                value={offersProducts}
                onValueChange={setOffersProducts}
                trackColor={{ false: "#bbb", true: COLORS.primary }}
                thumbColor={"#fff"}
              />
            </View>
          </View>

          {/* Secciones según selección */}
          <View style={[styles.section, { marginTop: 16 }]}>
            {offersServices && (
              <TouchableOpacity style={styles.row}>
                <Feather name="calendar" size={18} color={COLORS.text} />
                <Text style={styles.rowTxt}>Mis servicios</Text>
              </TouchableOpacity>
            )}

            {offersProducts && (
              <TouchableOpacity style={styles.row}>
                <Feather name="shopping-bag" size={18} color={COLORS.text} />
                <Text style={styles.rowTxt}>Mis productos</Text>
              </TouchableOpacity>
            )}

            {/* Reels disponible para ambos, si quieres puedes condicionarlo también */}
            <TouchableOpacity style={styles.row}>
              <Feather name="video" size={18} color={COLORS.text} />
              <Text style={styles.rowTxt}>Mis Reels</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Cerrar sesión */}
      <View style={[styles.section, { marginTop: 16 }]}>
        <TouchableOpacity style={styles.row} onPress={logout}>
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text style={[styles.rowTxt, { color: "#ef4444" }]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: { width: 64, height: 64, borderRadius: 999, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  email: { fontSize: 13, color: COLORS.subtext },
  roleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  roleTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  rowTxt: { fontSize: 14, color: COLORS.text },

  prefHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switchLabels: { flex: 1, paddingRight: 12 },
  switchTitle: { color: COLORS.text, fontWeight: "700" },
  switchHint: { color: COLORS.subtext, fontSize: 12, marginTop: 2 },
});