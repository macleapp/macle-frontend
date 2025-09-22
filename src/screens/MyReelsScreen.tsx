// src/screens/MyReelsScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator, Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "src/config";

type Reel = {
  id: string | number;
  thumbnail: string;     // URL miniatura
  videoUrl?: string;     // URL video (opcional)
  createdAt?: string;
  views?: number;
  likes?: number;
  title?: string;
};

type ApiResp = { ok: boolean; items: Reel[]; nextCursor?: string | null };

export default function MyReelsScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState<Reel[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [end, setEnd] = useState(false);

  const fetchPage = useCallback(async (reset = false) => {
    if (loadingMore || (end && !reset)) return;
    reset ? setEnd(false) : setLoadingMore(true);
    try {
      const url = new URL(`${API_BASE_URL}/api/media/my`);
      url.searchParams.set("type", "VIDEO");
      if (!reset && cursor) url.searchParams.set("cursor", cursor);
      const resp = await fetch(url.toString(), { headers: { "Content-Type": "application/json" } });
      const json: ApiResp = await resp.json();
      if (!resp.ok || !json.ok) throw new Error("No se pudo cargar");
      setData((prev) => (reset ? json.items : [...prev, ...json.items]));
      setCursor(json.nextCursor ?? null);
      if (!json.nextCursor) setEnd(true);
    } catch (e: any) {
      Alert.alert("Reels", e?.message ?? "Error al cargar");
    } finally {
      reset ? setRefreshing(false) : setLoadingMore(false);
    }
  }, [cursor, end, loadingMore]);

  useEffect(() => { fetchPage(true); }, []); // primera carga

  const onRefresh = () => {
    setRefreshing(true);
    setCursor(null);
    fetchPage(true);
  };

  const openReel = (item: Reel) => {
    // Navega a tu reproductor/Feed si lo tienes
    // navigation.navigate("Reels" as never); // ← si quieres abrir el feed
    Alert.alert("Reel", item.title || `ID ${item.id}`);
  };

  const renderItem = ({ item }: { item: Reel }) => (
    <TouchableOpacity
      onPress={() => openReel(item)}
      style={{ flexDirection: "row", padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={{ width: 100, height: 140, borderRadius: 8, backgroundColor: "#f3f4f6" }}
      />
      <View style={{ flex: 1, marginLeft: 12, justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontWeight: "800", color: "#111827" }} numberOfLines={2}>
            {item.title || "Reel"}
          </Text>
          {!!item.createdAt && (
            <Text style={{ color: "#6b7280", marginTop: 4 }}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row" }}>
          {!!item.views && (
            <Text style={{ color: "#6b7280", marginRight: 12 }}>{item.views} vistas</Text>
          )}
          {!!item.likes && <Text style={{ color: "#6b7280" }}>{item.likes} likes</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={() => fetchPage(false)}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ color: "#6b7280" }}>Aún no tienes reels.</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />

      {/* Botón flotante subir (ajusta navegación si tienes pantalla de upload) */}
      <TouchableOpacity
        onPress={() => Alert.alert("Reels", "Subir reel (pendiente de implementar)")}
        style={{
          position: "absolute", right: 16, bottom: 16, backgroundColor: "#4f46e5",
          paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>Subir reel</Text>
      </TouchableOpacity>
    </View>
  );
}