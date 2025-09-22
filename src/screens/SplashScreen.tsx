// src/screens/SplashScreen.tsx
import React, { useEffect } from "react";
import { View, Image, StyleSheet, StatusBar, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");
const COLORS = {
  bg: "#FFFFFF",       // fondo blanco
};

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const t = setTimeout(() => {
      // cuando termine el splash, ve al Welcome
      navigation.replace("Welcome");
    }, 1200); // 1.2s
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      {/* Usa tu logo azul sobre fondo blanco */}
      <Animatable.Image
        animation="fadeIn"
        duration={600}
        source={require("../assets/images/splash.png")} // o ../assets/images/logo.png
        resizeMode="contain"
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" },
  logo: {
    width: Math.min(260, width * 0.6),
    height: Math.min(80, width * 0.2),
  },
});