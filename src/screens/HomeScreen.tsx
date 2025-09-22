// src/screens/HomeScreen.tsx
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
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Item = {
  id: number;                 // ✅ número para evitar errores de tipo
  title: string;
  price?: string | number;
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
  tab: "#1506e6ff",
};

const CATEGORIES = [
  "Todos",
  "Belleza",
  "Hogar",
  "Tecnología",
  "Eventos",
  "Salud",
  "Comida",
  "Mecánica",
];

const MOCK: Item[] = [
  {
    id: 1,
    title: "Corte y barba",
    price: "L 250",
    sellerName: "Barber Shop Pro",
    category: "Belleza",
    img: "https://images.unsplash.com/photo-1621605815971-5b5f3e8caf1b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Pastel personalizado",
    price: "L 900",
    sellerName: "Dulce Arte",
    category: "Eventos",
    img: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Limpieza profunda",
    price: "L 1200",
    sellerName: "Clean&Go",
    category: "Hogar",
    img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Arreglo de laptop",
    price: "L 700",
    sellerName: "TechFix",
    category: "Tecnología",
    img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [activeCat, setActiveCat] = useState("Todos");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>(MOCK.map(i => ({ ...i, liked: false })));

  const filtered = useMemo(() => {
    let base =
      activeCat === "Todos" ? items : items.filter(i => i.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      base = base.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.sellerName.toLowerCase().includes(q)
      );
    }
    return base;
  }, [items, activeCat, query]);

  const toggleLike = useCallback((id: number) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, liked: !i.liked } : i)));
  }, []);

  const shareItem = useCallback(async (item: Item) => {
    try {
      await Share.share({
        message: `Mira esto en MACLE: ${item.title} de ${item.sellerName} (${item.price ?? ""})`,
      });
    } catch {}
  }, []);

  const openDetail = useCallback(
    (id: number) => navigation.navigate("ProductDetail", { id }),
    [navigation]
  );

  const openSeller = useCallback(
    (sellerId: number) => navigation.navigate("SellerProfile", { id: sellerId }),
    [navigation]
  );

  return (
    <SafeAreaView style={styles.safe}>

     
      {/* Buscador */}
      <View style={styles.searchRow}>
        <Feather name="search" size={20} color={COLORS.subtext} />
        <TextInput
          style={styles.input}
          placeholder="Buscar productos o servicios"
          placeholderTextColor={COLORS.subtext}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity onPress={() => navigation.navigate("Map" as never)}>
          <Feather name="map-pin" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* CTA Reels */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Reels" as never)}
        style={styles.reelsBtn}
      >
        <Feather name="video" size={18} color="#fff" />
        <Text style={styles.reelsTxt}>Ver Reels</Text>
      </TouchableOpacity>

      {/* Categorías */}
      <FlatList
        data={CATEGORIES}
        keyExtractor={(c) => c}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => {
          const active = item === activeCat;
          return (
            <TouchableOpacity
              onPress={() => setActiveCat(item)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Grid */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openDetail(item.id)}>
            <Image source={{ uri: item.img }} style={styles.cardImg} />
            <View style={{ padding: 10, gap: 4 }}>
              <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
              <TouchableOpacity onPress={() => openSeller(item.id)}>
                <Text numberOfLines={1} style={styles.cardSeller}>{item.sellerName}</Text>
              </TouchableOpacity>
              {!!item.price && (
                <Text style={styles.cardPrice}>
                  {typeof item.price === "number" ? `L ${item.price}` : item.price}
                </Text>
              )}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => toggleLike(item.id)}
                  hitSlop={8}
                >
                  <MaterialIcons
                    name={item.liked ? "favorite" : "favorite-border"}
                    size={20}
                    color={item.liked ? "#ef4444" : COLORS.text}
                  />
                  <Text style={styles.iconTxt}>{item.liked ? "Me gusta" : "Like"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => shareItem(item)}
                  hitSlop={8}
                >
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
              No hay resultados para esta categoría/búsqueda.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const CARD_RADIUS = 14;

const styles = StyleSheet.create({

header: {
  backgroundColor: COLORS.primary,
  paddingVertical: 12,
  alignItems: "center",
  justifyContent: "center",
},
headerTitle: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "900",
},

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
  input: { flex: 1, paddingVertical: 10, color: COLORS.text },

  reelsBtn: {
    marginTop: 4,
    marginHorizontal: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  reelsTxt: { color: "#fff", fontWeight: "700" },

  catList: { marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.text, fontSize: 13 },
  chipTextActive: { color: "#fff", fontWeight: "700" },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImg: { width: "100%", height: 120 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  cardSeller: { fontSize: 12, color: COLORS.subtext, textDecorationLine: "underline" },
  cardPrice: { marginTop: 2, fontSize: 14, fontWeight: "700", color: COLORS.primary },
  cardActions: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconTxt: { fontSize: 12, color: COLORS.text },
});