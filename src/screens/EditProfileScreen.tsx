// src/screens/EditProfileScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View, Text, TextInput, Switch, TouchableOpacity, ActivityIndicator, Alert, ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "src/config";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string>("");
  const [city, setCity] = useState<string>("");

  // métricas para insignias (opcionales)
  const [hasRealPhoto, setHasRealPhoto] = useState(false);
  const [realNameVerified, setRealNameVerified] = useState(false);
  const [ratingAvg, setRatingAvg] = useState<string>("");
  const [responseRate, setResponseRate] = useState<string>("");
  const [responseTimeMs, setResponseTimeMs] = useState<string>("");
  const [onTimeRate, setOnTimeRate] = useState<string>("");
  const [categoryPercentile, setCategoryPercentile] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  const disabled = useMemo(() => submitting || !name.trim(), [submitting, name]);

  async function onSave() {
    if (!name.trim()) {
      Alert.alert("Perfil", "El nombre es obligatorio");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        phone: phone?.trim() || null,
        city: city?.trim() || null,
        hasRealPhoto,
        realNameVerified,
        ratingAvg: ratingAvg ? Number(ratingAvg) : null,
        responseRate: responseRate ? Number(responseRate) : null,
        responseTimeMs: responseTimeMs ? Number(responseTimeMs) : null,
        onTimeRate: onTimeRate ? Number(onTimeRate) : null,
        categoryPercentile: categoryPercentile ? Number(categoryPercentile) : null,
      };

      const resp = await fetch(`${API_BASE_URL}/api/users/profiles/seller`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Incluye tu token si usas auth por header:
          // Authorization: Bearer ${token},
        },
        body: JSON.stringify(body),
      });

      const json = await resp.json();
      if (!resp.ok || !json?.ok) {
        throw new Error(json?.message || "No se pudo guardar");
      }

      Alert.alert("Perfil", "Cambios guardados", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontWeight: "700", color: "#111827", marginBottom: 6 }}>{children}</Text>
  );

  const Input = (p: any) => (
    <TextInput
      {...p}
      style={{
        borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, color: "#111827",
      }}
      placeholderTextColor="#9ca3af"
    />
  );

  const Row = ({ children }: { children: React.ReactNode }) => (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
      {children}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 12 }}>Editar perfil</Text>

      <Label>Nombre *</Label>
      <Input value={name} onChangeText={setName} placeholder="Dulce Arte HN" />

      <View style={{ height: 12 }} />

      <Label>Teléfono</Label>
      <Input value={phone} onChangeText={setPhone} placeholder="+504 9999-8888" keyboardType="phone-pad" />

      <View style={{ height: 12 }} />

      <Label>Ciudad</Label>
      <Input value={city} onChangeText={setCity} placeholder="Tegucigalpa" />

      <Text style={{ marginTop: 18, fontWeight: "800" }}>Insignias (opcional)</Text>

      <Row>
        <Text style={{ color: "#111827" }}>Foto real</Text>
        <Switch value={hasRealPhoto} onValueChange={setHasRealPhoto} />
      </Row>

      <Row>
        <Text style={{ color: "#111827" }}>Nombre real verificado</Text>
        <Switch value={realNameVerified} onValueChange={setRealNameVerified} />
      </Row>

      <View style={{ height: 12 }} />
      <Label>Rating promedio (0–5)</Label>
      <Input value={ratingAvg} onChangeText={setRatingAvg} placeholder="4.6" keyboardType="decimal-pad" />

      <View style={{ height: 12 }} />
      <Label>% respuesta (0–100)</Label>
      <Input value={responseRate} onChangeText={setResponseRate} placeholder="92" keyboardType="number-pad" />

      <View style={{ height: 12 }} />
      <Label>Tiempo resp. (ms)</Label>
      <Input value={responseTimeMs} onChangeText={setResponseTimeMs} placeholder="1800000" keyboardType="number-pad" />

      <View style={{ height: 12 }} />
      <Label>% puntualidad (0–100)</Label>
      <Input value={onTimeRate} onChangeText={setOnTimeRate} placeholder="97" keyboardType="number-pad" />

      <View style={{ height: 12 }} />
      <Label>Percentil categoría (0 mejor)</Label>
      <Input value={categoryPercentile} onChangeText={setCategoryPercentile} placeholder="5" keyboardType="number-pad" />

      <View style={{ height: 20 }} />

      <TouchableOpacity
        onPress={onSave}
        disabled={disabled}
        style={{
          backgroundColor: disabled ? "#c7d2fe" : "#4f46e5",
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "800" }}>Guardar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}