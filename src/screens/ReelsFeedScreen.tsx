// src/screens/ReelsFeedScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Share,
  Dimensions,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { height, width } = Dimensions.get("window");

const COLORS = {
  primary: "#06b6d4",
  bg: "#ffffff",
  text: "#111827",
  subtext: "#6b7280",
  border: "#00000033",
};

type Reel = {
  id: string;
  title: string;
  creator: string;
  location?: string;
  cover: string; // portada del “video”
  liked?: boolean;
};

const MOCK_REELS: Reel[] = [
  {
    id: "rv1",
    title: "Pastel viral de 3 leches",
    creator: "María López",
    location: "Tegucigalpa, HN",
    cover:
      "https://images.unsplash.com/photo-1551022370-1c7e5d3543a9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "rv2",
    title: "Antes y después corte de barba",
    creator: "Carlos Barber",
    location: "San Pedro Sula, HN",
    cover:
      "https://images.unsplash.com/photo-1621605815971-5b5f3e8caf1b?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "rv3",
    title: "Decoración express para fiesta",
    creator: "Eventos HN",
    location: "Comayagua, HN",
    cover:
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function ReelsFeedScreen() {
  const [reels, setReels] = useState(ReelWithState(MOCK_REELS));

  const toggleLike = useCallback((id: string) => {
    setReels(prev => prev.map(r => (r.id === id ? { ...r, liked: !r.liked } : r)));
  }, []);

  const shareReel = useCallback(async (r: Reel) => {
    try {
      await Share.share({
        message: `Mira este reel en MACLE: ${r.title} por ${r.creator}`,
      });
    } catch {}
  }, []);

  return (
    <View style={styles.safe}>
      <FlatList
        data={reels}
        keyExtractor={(r) => r.id}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ImageBackground source={{ uri: item.cover }} style={styles.slide}>
            <View style={styles.overlay} />

            {/* Info del creador */}
            <View style={styles.infoBox}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.creator}
                {item.location ? ` • ${item.location}` : ""}
              </Text>
            </View>

            {/* Acciones */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
                <MaterialIcons
                  name={item.liked ? "favorite" : "favorite-border"}
                  size={28}
                  color={item.liked ? "#ef4444" : "#fff"}
                />
                <Text style={styles.actionTxt}>{item.liked ? "Me gusta" : "Like"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => shareReel(item)}>
                <Feather name="share-2" size={26} color="#fff" />
                <Text style={styles.actionTxt}>Compartir</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        )}
      />
    </View>
  );
}

function ReelWithState(arr: Reel[]): Reel[] {
  return arr.map(r => ({ ...r, liked: false }));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  slide: {
    width,
    height,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  infoBox: {
    paddingHorizontal: 14,
    paddingBottom: 90, // deja espacio para acciones
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  meta: {
    color: "#e5e7eb",
    marginTop: 4,
  },
  actions: {
    position: "absolute",
    right: 14,
    bottom: 32,
    gap: 18,
    alignItems: "center",
  },
  actionBtn: { alignItems: "center", justifyContent: "center" },
  actionTxt: { color: "#fff", marginTop: 4, fontSize: 12 },
});