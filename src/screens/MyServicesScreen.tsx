// src/screens/MyServicesScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert
} from "react-native";
import { API_BASE_URL } from "src/config";

type Service = {
  id: number;
  name: string;
  price?: number;        // si manejas precio por servicio
  description?: string;
  createdAt?: string;
};

type ApiList = { ok: boolean; items: Service[] };

export default function MyServicesScreen() {
  const [data, setData] = useState<Service[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/api/services/my`);
      const json: ApiList = await resp.json();
      if (!resp.ok || !json.ok) throw new Error("No se pudo cargar");
      setData(json.items || []);
    } catch (e: any) {
      Alert.alert("Servicios", e?.message ?? "Error al cargar");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const deleteService = (id: number) => {
    Alert.alert("Eliminar", "¿Eliminar este servicio?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive", onPress: async () => {
          try {
            const resp = await fetch(`${API_BASE_URL}/api/services/${id}`, { method: "DELETE" });
            const json = await resp.json();
            if (!resp.ok || !json?.ok) throw new Error(json?.message || "No se pudo eliminar");
            setData((prev) => prev.filter((s) => s.id !== id));
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "No se pudo eliminar");
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: Service }) => (
    <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
      <Text style={{ fontWeight: "800", color: "#111827" }} numberOfLines={1}>{item.name}</Text>
      {!!item.price && <Text style={{ color: "#4f46e5", fontWeight: "800", marginTop: 2 }}>L {item.price.toFixed(2)}</Text>}
      {!!item.description && <Text style={{ color: "#6b7280", marginTop: 4 }} numberOfLines={2}>{item.description}</Text>}
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <TouchableOpacity onPress={() => Alert.alert("Servicio", "Editar (pendiente)")} style={{ marginRight: 12 }}>
          <Text style={{ color: "#2563eb", fontWeight: "800" }}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteService(item.id)}>
          <Text style={{ color: "#ef4444", fontWeight: "800" }}>Borrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<View style={{ padding: 24 }}><Text style={{ color: "#6b7280" }}>Aún no tienes servicios.</Text></View>}
      />

      {/* Botón flotante crear */}
      <TouchableOpacity
        onPress={() => Alert.alert("Servicio", "Crear servicio (pendiente)")}
        style={{
          position: "absolute", right: 16, bottom: 16, backgroundColor: "#4f46e5",
          paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>Agregar servicio</Text>
      </TouchableOpacity>
    </View>
  );
}