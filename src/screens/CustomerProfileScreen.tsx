// src/screens/CustomerProfileScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  Linking,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const COLORS = {
  primary: "#1506e6ff", 
  bg: "#ffffff",
  text: "#111827",
  subtext: "#6b7280",
  border: "#E5E7EB",
};

// === Config rápida ===
// URL a donde cobras la verificación (ajústala a tu back/pasarela)
const PAY_URL = "http://10.0.2.2:3000/pay/verify";
// Endpoint opcional para iniciar verificación después de pagar
const START_VERIFY_URL = "http://10.0.2.2:3000/api/customers/verify/start";

// Si ya tienes tu store de auth, reemplaza por tu getter real:
function getToken(): string | null {
  // p.ej. return authStore.getState().accessToken;
  return null;
}

type Purchase = { id: number; title: string; date: string; total: string };
type Favorite = { id: number; title: string };

type Customer = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  preferences?: string[];
  verified: boolean;                 // estado final de cuenta verificada
  hasPaidForVerification: boolean;   // pagó la verificación (habilita el botón)
  purchases: Purchase[];
  favorites: Favorite[];
  privacy: { showEmail: boolean; showPhone: boolean; showPurchases: boolean };
};

const MOCK: Customer = {
  id: 7,
  name: "Daisy García",
  email: "dgp0505hg@gmail.com",
  phone: "+504 9999 8888",
  avatar:
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop",
  bio: "Amante de la repostería y gadgets.",
  preferences: ["Belleza", "Tecnología", "Hogar"],
  verified: false,
  hasPaidForVerification: false, // ⇠ cámbialo a true para probar el flujo “Verificar”
  purchases: [
    { id: 1, title: "Corte y barba", date: "2025-08-30", total: "L 250" },
    { id: 2, title: "Funda iPhone 14", date: "2025-09-01", total: "L 350" },
  ],
  favorites: [
    { id: 99, title: "Arreglo de laptop" },
    { id: 98, title: "Limpieza profunda" },
  ],
  privacy: { showEmail: true, showPhone: false, showPurchases: true },
};

export default function CustomerProfileScreen() {
  const [me, setMe] = useState<Customer>(MOCK);
  const canVerify = !me.verified && me.hasPaidForVerification;

  const onPressVerify = async () => {
    // Si NO ha pagado, lo llevamos al pago
    if (!me.hasPaidForVerification) {
      try {
        await Linking.openURL(PAY_URL);
      } catch {
        Alert.alert("MACLE", "No pudimos abrir la página de pago.");
      }
      return;
    }

    // Si ya pagó y aún no está verificado, iniciamos verificación
    if (canVerify) {
      try {
        const token = getToken();
        // Descomenta esto cuando tengas tu JWT y endpoint activos:
        /*
        await fetch(START_VERIFY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: Bearer ${token} } : {}),
          },
        }).then(r => {
          if (!r.ok) throw new Error("verify start failed");
        });
        */
        // Simulamos éxito local para la demo:
        setMe((prev) => ({ ...prev, verified: true }));
        Alert.alert("MACLE", "Tu cuenta fue verificada correctamente.");
      } catch {
        Alert.alert(
          "MACLE",
          "No se pudo completar la verificación. Intenta más tarde."
        );
      }
    }
  };

  const verifyLabel = me.verified
    ? "Verificado"
    : me.hasPaidForVerification
    ? "Verificar"
    : "Pagar y verificar";

  const verifyDisabled = me.verified;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <Image source={{ uri: me.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.name}>{me.name}</Text>
            {me.verified && (
              <MaterialIcons name="verified" size={18} color={COLORS.primary} />
            )}
          </View>
          {me.bio ? <Text style={styles.muted}>{me.bio}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.verifyBtn, verifyDisabled && styles.verifyBtnDisabled]}
          onPress={onPressVerify}
          disabled={verifyDisabled}
        >
          <Feather name="shield" size={16} color="#fff" />
          <Text style={styles.verifyTxt}>{verifyLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contacto</Text>
        <View style={styles.row}>
          <Feather name="mail" size={16} color={COLORS.subtext} />
          <Text style={styles.infoTxt}>
            {me.privacy.showEmail ? me.email : "Oculto"}
          </Text>
        </View>
        <View style={styles.row}>
          <Feather name="phone" size={16} color={COLORS.subtext} />
          <Text style={styles.infoTxt}>
            {me.privacy.showPhone ? me.phone : "Oculto"}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferencias</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {me.preferences?.map((p) => (
            <View key={p} style={styles.tag}>
              <Text style={{ color: COLORS.text }}>{p}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historial de compras</Text>
        {me.privacy.showPurchases ? (
          <FlatList
            data={me.purchases}
            keyExtractor={(p) => String(p.id)}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={styles.purchaseRow}>
                <Text style={{ color: COLORS.text, fontWeight: "700" }}>
                  {item.title}
                </Text>
                <Text style={styles.muted}>
                  {item.date} • {item.total}
                </Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.muted}>Oculto</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Favoritos</Text>
        <FlatList
          data={me.favorites}
          keyExtractor={(f) => String(f.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          renderItem={({ item }) => (
            <View style={styles.favorite}>
              <Feather name="heart" size={14} color={COLORS.primary} />
              <Text style={{ color: COLORS.text }}>{item.title}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacidad</Text>
        <Text style={styles.muted}>
          Email: {me.privacy.showEmail ? "Visible" : "Oculto"}
        </Text>
        <Text style={styles.muted}>
          Teléfono: {me.privacy.showPhone ? "Visible" : "Oculto"}
        </Text>
        <Text style={styles.muted}>
          Compras: {me.privacy.showPurchases ? "Visible" : "Oculto"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 72,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  name: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  muted: { color: COLORS.subtext },

  verifyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verifyBtnDisabled: { opacity: 0.6 },
  verifyTxt: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  cardTitle: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoTxt: { color: COLORS.text },

  tag: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },

  purchaseRow: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
  },
  favorite: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});