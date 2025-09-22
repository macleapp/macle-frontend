// src/screens/PublishScreen.tsx
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

const COLORS = {
  primary: "#1506e6ff",
  bg: "#ffffff",
  text: "#111827",
  subtext: "#6b7280",
  border: "#00000033",
};

type PublishType = "Producto" | "Servicio";
const CATEGORIES = ["Belleza", "Tecnología", "Hogar", "Comida", "Transporte", "Otros"];

export default function PublishScreen() {
  const [type, setType] = useState<PublishType>("Producto");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [desc, setDesc] = useState("");
  const [isSending, setIsSending] = useState(false);

  const canSubmit = useMemo(() => {
    if (!title.trim() || !desc.trim()) return false;
    if (type === "Producto" && !price.trim()) return false;
    return true;
  }, [title, desc, price, type]);

  const submit = async () => {
    if (!canSubmit) return;
    setIsSending(true);
    // Simula “enviar al backend”
    setTimeout(() => {
      setIsSending(false);
      Alert.alert(
        "Publicado",
        `Tu ${type.toLowerCase()} fue publicado (demo).\n\nTítulo: ${title}\nCategoría: ${category}${
          type === "Producto" ? `\nPrecio: L.${price}` : ""
        }`
      );
      // Resetea
      setTitle("");
      setPrice("");
      setDesc("");
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Selector tipo */}
        <View style={styles.segment}>
          {(["Producto", "Servicio"] as PublishType[]).map((opt) => {
            const active = type === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setType(opt)}
                style={[styles.segmentBtn, active && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentTxt, active && styles.segmentTxtActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Título */}
        <Text style={styles.label}>Título</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={`Nombre del ${type.toLowerCase()}`}
          placeholderTextColor={COLORS.subtext}
          style={styles.input}
          maxLength={60}
        />
        <Text style={styles.help}>{title.length}/60</Text>

        {/* Precio solo para Producto */}
        {type === "Producto" && (
          <>
            <Text style={styles.label}>Precio (Lempiras)</Text>
            <View style={styles.inputRow}>
              <Feather name="tag" size={18} color={COLORS.subtext} />
              <TextInput
                value={price}
                onChangeText={(t) => {
                  // solo dígitos
                  const clean = t.replace(/[^0-9.]/g, "");
                  setPrice(clean);
                }}
                keyboardType="decimal-pad"
                placeholder="Ej. 250"
                placeholderTextColor={COLORS.subtext}
                style={[styles.input, { borderWidth: 0, flex: 1, marginLeft: 8 }]}
              />
            </View>
          </>
        )}

        {/* Categoría (mock “picker”) */}
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pillRow}>
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={[styles.pillTxt, active && styles.pillTxtActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Descripción */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={desc}
          onChangeText={setDesc}
          placeholder={`Describe tu ${type.toLowerCase()}…`}
          placeholderTextColor={COLORS.subtext}
          style={[styles.input, { height: 120, textAlignVertical: "top" }]}
          multiline
          maxLength={500}
        />
        <Text style={styles.help}>{desc.length}/500</Text>

        {/* Botón publicar */}
        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit || isSending}
          style={[styles.submit, (!canSubmit || isSending) && { opacity: 0.6 }]}
        >
          <Feather name="upload" size={18} color="#fff" />
          <Text style={styles.submitTxt}>{isSending ? "Publicando…" : "Publicar"}</Text>
        </TouchableOpacity>

        {/* Nota */}
        <Text style={styles.note}>
          Tip: Las imágenes y el inventario se agregan en la versión completa. Aquí es un flujo demo
          para que valides UX y colores de MACLE.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.text,
    marginTop: 14,
    marginBottom: 6,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
  },
  inputRow: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  help: { color: COLORS.subtext, fontSize: 12, marginTop: 4 },

  segment: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    gap: 4,
    alignSelf: "flex-start",
  },
  segmentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primary,
  },
  segmentTxt: { color: COLORS.text, fontWeight: "600" },
  segmentTxtActive: { color: "#fff" },

  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillTxt: { color: COLORS.text, fontSize: 12 },
  pillTxtActive: { color: "#fff", fontWeight: "700" },

  submit: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  submitTxt: { color: "#fff", fontWeight: "700" },
  note: { color: COLORS.subtext, fontSize: 12, marginTop: 10, lineHeight: 18 },
});