// src/screens/SearchScreen.tsx
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Share,
  SafeAreaView,
  TextInput,
  Keyboard,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Item = {
  id: string;
  title: string;
  sellerName: string;
  category: string;
  img: string;
  liked?: boolean;
};

const COLORS = {
  primary: "#1506e6ff",
  bg: "#ffffff",
  text: "#111827",
  subtext: "#6b7280",
  border: "#00000033",
};

const CATEGORIES = ["Todos", "Servicios", "Productos", "Express", "Promos"];

const MOCK: Item[] = [
  {
    id: "r1",
    title: "Manicure spa",
    sellerName: "Beauty Hub",
    category: "Servicios",
    img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r2",
    title: "Funda iPhone 14",
    sellerName: "TechCase",
    category: "Productos",
    img: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r3",
    title: "Desayuno sorpresa",
    sellerName: "Detalles HN",
    category: "Express",
    img: "https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("Todos");
  const [items, setItems] = useState<Item[]>(MOCK.map(i => ({ ...i, liked: false })));
  const [history, setHistory] = useState<string[]>(["barbería", "limpieza", "pasteles"]);

  const filtered = useMemo(() => {
    let base = activeCat === "Todos" ? items : items.filter(i => i.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      base = base.filter(
        i => i.title.toLowerCase().includes(q) || i.sellerName.toLowerCase().includes(q)
      );
    }
    return base;
  }, [items, activeCat, query]);

  const submitSearch = useCallback(() => {
    const q = query.trim();
    if (q && !history.includes(q)) setHistory([q, ...history].slice(0, 6));
    Keyboard.dismiss();
  }, [query, history]);

  const useHistory = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const toggleLike = useCallback((id: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, liked: !i.liked } : i)));
  }, []);

  const shareItem = useCallback(async (item: Item) => {
    try {
      await Share.share({
        message: `Búscalo en MACLE: ${item.title} de ${item.sellerName}`,
      });
    } catch {}
  }, []);

  const openDetail = useCallback(
    (id: string) => navigation.navigate("ProductDetail", { id: Number(id) }),
    [navigation]
  );

  const openSeller = useCallback(
    () => navigation.navigate("SellerProfile", { id: 0 }), // número dummy o real
    [navigation]
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Buscador */}
      <View style={styles.searchRow}>
        <Feather name="search" size={20} color={COLORS.subtext} />
        <TextInput
          style={styles.input}
          placeholder="¿Qué necesitas hoy?"
          placeholderTextColor={COLORS.subtext}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={submitSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Feather name="x" size={20} color={COLORS.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros rápidos */}
      <FlatList
        data={CATEGORIES}
        keyExtractor={(c) => c}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        style={{ marginBottom: 8 }}
        renderItem={({ item }) => {
          const active = item === activeCat;
          return (
            <TouchableOpacity
              onPress={() => setActiveCat(item)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Historial */}
      {history.length > 0 && !query && (
        <View style={styles.history}>
          <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
          <View style={styles.tagsRow}>
            {history.map(h => (
              <TouchableOpacity key={h} style={styles.tag} onPress={() => useHistory(h)}>
                <Feather name="clock" size={14} color={COLORS.subtext} />
                <Text style={styles.tagTxt}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Resultados */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.rowCard} onPress={() => openDetail(item.id)}>
            <Image source={{ uri: item.img }} style={styles.thumb} />
            <View style={{ flex: 1, paddingVertical: 8, paddingRight: 6 }}>
              <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
              <TouchableOpacity onPress={openSeller}>
                <Text numberOfLines={1} style={styles.seller}>{item.sellerName}</Text>
              </TouchableOpacity>
              <Text style={styles.category}>{item.category}</Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => toggleLike(item.id)}>
                  <MaterialIcons
                    name={item.liked ? "favorite" : "favorite-border"}
                    size={20}
                    color={item.liked ? "#ef4444" : COLORS.text}
                  />
                  <Text style={styles.iconTxt}>{item.liked ? "Me gusta" : "Like"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconBtn} onPress={() => shareItem(item)}>
                  <Feather name="share-2" size={18} color={COLORS.text} />
                  <Text style={styles.iconTxt}>Compartir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ textAlign: "center", color: COLORS.subtext }}>
              No encontramos resultados. Prueba otra palabra.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: "#fff",
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: COLORS.text,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { color: COLORS.text, fontSize: 13 },
  chipTextActive: { color: "#fff", fontWeight: "700" },

  history: { paddingHorizontal: 12, paddingVertical: 6 },
  sectionTitle: {
    fontSize: 13,
    color: COLORS.subtext,
    marginBottom: 6,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  tagTxt: { color: COLORS.text, fontSize: 12 },

  rowCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
    overflow: "hidden",
  },
  thumb: { width: 96, height: 96 },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  seller: { fontSize: 12, color: COLORS.subtext, textDecorationLine: "underline" },
  category: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  actions: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconTxt: { fontSize: 12, color: COLORS.text },
});