// src/navigation/AuthGate.tsx
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { getTokens } from "../utils/authStorage";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AuthGate() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    (async () => {
      try {
        const tokens = await getTokens();
        const hasAccess = Boolean(tokens?.accessToken);
        navigation.reset({
          index: 0,
          routes: [{ name: hasAccess ? "Tabs" : "Login" }],
        });
      } catch {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    })();
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}