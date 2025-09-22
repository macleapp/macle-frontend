// src/screens/FavoritesScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const COLORS = {
  primary: "#1506e6ff",
  bg: "#ffffff",
  text: "#111827",
  subtext: "#6b7280",
  border: "#00000033",
};

type Favorite = {
  id: string;
  title: string;
  sellerName: string;
  img: string;
};

const MOCK_FAVORITES: Favorite[] = [
  {
    id: "f1",
    title: "Pastel de chocolate",
    sellerName: "Dulce Arte",
    img: "https://images.unsplash.com/photo-1606890737304-57a1ca8a7d0d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "f2",
    title: "Servicio de plomería",
    sellerName: "Juan Pérez",
    img: "https://images.unsplash.com/photo-1581579188871-c65e7b8a4f80?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>(MOCK_FAVORITES);

  const remove = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  return (
    <View style={styles.safe}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(f) => f.id}
          contentContainerStyle={{ padding: 12 }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image source={{ uri: item.img }} style={styles.thumb} />
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
                <Text numberOfLines={1} style={styles.seller}>{item.sellerName}</Text>
              </View>
              <TouchableOpacity onPress={() => remove(item.id)}>
                <MaterialIcons name="favorite" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.empty}>
          <MaterialIcons name="favorite-border" size={40} color={COLORS.subtext} />
          <Text style={styles.emptyTitle}>No tienes favoritos</Text>
          <Text style={styles.emptyText}>
            Marca productos o servicios con ❤ para verlos aquí.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  sep: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  seller: { fontSize: 13, color: COLORS.subtext },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: { color: COLORS.text, fontWeight: "700", fontSize: 16 },
  emptyText: { color: COLORS.subtext, textAlign: "center" },
});