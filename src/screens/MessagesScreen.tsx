// src/screens/MessagesScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

const COLORS = {
  primary: "#1506e6ff",
  bg: "#ffffff",
  text: "#111827",
  subtext: "#6b7280",
  border: "#00000033",
};

type Chat = {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  avatar: string;
};

const MOCK_CHATS: Chat[] = [
  {
    id: "c1",
    name: "María López",
    lastMsg: "Gracias por tu pedido!",
    time: "12:30",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "c2",
    name: "Carlos Barber",
    lastMsg: "Te espero mañana a las 4pm.",
    time: "Ayer",
    avatar:
      "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=300&auto=format&fit=crop",
  },
];

export default function MessagesScreen() {
  const [query, setQuery] = useState("");

  const filtered = MOCK_CHATS.filter(
    c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.lastMsg.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.safe}>
      {/* Buscador */}
      <View style={styles.searchRow}>
        <Feather name="search" size={18} color={COLORS.subtext} />
        <TextInput
          style={styles.input}
          placeholder="Buscar chats"
          placeholderTextColor={COLORS.subtext}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Lista de chats */}
      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {item.lastMsg}
              </Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ textAlign: "center", color: COLORS.subtext }}>
              No se encontraron conversaciones
            </Text>
          </View>
        }
      />
    </View>
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
  input: { flex: 1, paddingVertical: 10, color: COLORS.text },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 999 },
  name: { color: COLORS.text, fontWeight: "700", fontSize: 15 },
  lastMsg: { color: COLORS.subtext, marginTop: 2, fontSize: 13 },
  time: { color: COLORS.subtext, fontSize: 12 },
});