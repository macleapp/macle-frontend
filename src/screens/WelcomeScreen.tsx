// src/screens/WelcomeScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

const { width } = Dimensions.get("window");

const COLORS = {
  background: "#FFFFFF",
  text: "#111111",
  subtext: "#666666",
  primary: "#1506e6ff",
  border: "#E0E0E0",
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const finishOnboarding = async (next: "Login" | "Register" | "Tabs") => {
    try {
      await AsyncStorage.setItem("onboarding:done", "1");
    } catch {}
    // Evita el error “The action 'RESET'…” usando replace/navigate
    navigation.replace(next);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <Animatable.Image
        animation="fadeInDown"
        duration={700}
        delay={40}
        source={require("../assets/images/logo.png")}
        resizeMode="contain"
        style={styles.logo}
      />

      <Animatable.View animation="fadeInUp" delay={120} style={styles.textWrap}>
        <Text style={styles.title}>{t("welcome.title")}</Text>
        <Text style={styles.subtitle}>{t("welcome.subtitle")}</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={200} style={styles.buttons}>
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.9}
          onPress={() => finishOnboarding("Register")}
        >
          <Text style={styles.btnPrimaryText}>{t("welcome.ctaSeller")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          activeOpacity={0.9}
          onPress={() => finishOnboarding("Tabs")}
        >
          <Text style={styles.btnOutlineText}>{t("welcome.ctaClient")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => finishOnboarding("Login")}
        >
          <Text style={styles.linkText}>{t("continue")}</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: Math.min(200, width * 0.5),
    height: Math.min(200, width * 0.5),
    marginBottom: 18,
  },
  textWrap: { alignItems: "center", marginBottom: 28, paddingHorizontal: 8 },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: COLORS.subtext,
    textAlign: "center",
    lineHeight: 22,
  },
  buttons: { width: "100%", alignItems: "center" },
  btnPrimary: {
    width: "100%",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  btnPrimaryText: { color: COLORS.background, fontWeight: "800", fontSize: 16 },
  btnOutline: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    marginBottom: 8,
  },
  btnOutlineText: { color: COLORS.primary, fontWeight: "800", fontSize: 16 },
  link: { marginTop: 10, padding: 8 },
  linkText: { color: COLORS.primary, fontWeight: "700" },
});