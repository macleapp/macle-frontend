// src/screens/MapScreen.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Feather from "react-native-vector-icons/Feather";

const COLORS = {
  primary: "#06b6d4",
  bg: "#ffffff",
  text: "#111827",
  subtext: "#6b7280",
  border: "#00000033",
};

const NEARBY = [
  { id: "n1", title: "Barbería Central", distance: "0.8 km" },
  { id: "n2", title: "Dulce Arte (pasteles)", distance: "1.2 km" },
  { id: "n3", title: "Clean&Go (limpieza)", distance: "2.0 km" },
];

export default function MapScreen() {
  return (
    <View style={styles.safe}>
      {/* “Mapa” de relleno */}
      <View style={styles.mapMock}>
        <Feather name="map" size={40} color={COLORS.subtext} />
        <Text style={{ color: COLORS.subtext, marginTop: 8 }}>Mapa (vista demo)</Text>
      </View>

      {/* Panel inferior con cercanos */}
      <ScrollView style={styles.bottom}>
        <Text style={styles.title}>Cerca de ti</Text>

        {NEARBY.map((n) => (
          <View key={n.id} style={styles.row}>
            <View>
              <Text style={styles.itemTitle}>{n.title}</Text>
              <Text style={styles.itemMeta}>{n.distance}</Text>
            </View>
            <TouchableOpacity style={styles.cta}>
              <Feather name="navigation" size={18} color="#fff" />
              <Text style={styles.ctaTxt}>Ir</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  mapMock: {
    height: 260,
    margin: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  title: { color: COLORS.text, fontWeight: "800", marginBottom: 8 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTitle: { color: COLORS.text, fontWeight: "700" },
  itemMeta: { color: COLORS.subtext, marginTop: 2 },
  cta: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaTxt: { color: "#fff", fontWeight: "700" },
});