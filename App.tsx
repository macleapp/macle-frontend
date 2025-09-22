// App.tsx
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { StatusBar, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// 🔔 Push
import messaging from "@react-native-firebase/messaging";

// --- Si aún no tienes estos archivos, créalos después ---
let api: any = { post: async () => {} };
try {
  api = require("./src/lib/api");
} catch {}
let navigate: any = () => {};
try {
  navigate = require("./src/navigation/RootNavigation").navigate;
} catch {}

// Screens
import AuthGate from "./src/navigation/AuthGate";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import Tabs from "./src/navigation/Tabs";
import ProductDetailScreen from "./src/screens/ProductDetailScreen";
import SellerProfileScreen from "./src/screens/SellerProfileScreen";
import MapScreen from "./src/screens/MapScreen";
import ReelsFeedScreen from "./src/screens/ReelsFeedScreen";
import CustomerProfileScreen from "./src/screens/CustomerProfileScreen";
import ChatScreen from "./src/screens/ChatScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import MyReelsScreen from "./src/screens/MyReelsScreen";
import { enableScreens } from 'react-native-screens';
enableScreens(true);

// i18n
import "./src/i18n";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNBootSplash from "react-native-bootsplash";

export type RootStackParamList = {
  Welcome: undefined;
  ServiceProfile: { id: number };
  Business: { id: number };
  AuthGate: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Tabs: undefined;
  ProductDetail: { id: number };
  SellerProfile: { id: number };
  Map: undefined;
  Reels: undefined;
  CustomerProfile: undefined;
  Chat: { sellerId: number; sellerName: string } | undefined;
  Settings: undefined;
  EditProfile: undefined;
  MyReels: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "#ffffff" },
};

export async function setLang(lang: "en" | "es") {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem("app:lang", lang);
}

export default function App() {
  useTranslation();
  const [boot, setBoot] = useState<"loading" | "welcome" | "app">("loading");

  useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []);

  useEffect(() => {
    // idioma guardado
    AsyncStorage.getItem("app:lang").then((v) => {
      if (v) i18n.changeLanguage(v);
    });
    // primera vez -> Welcome
    AsyncStorage.getItem("welcome:seen:v2").then((v) => {
      setBoot(v ? "app" : "welcome");
    });
    // Google
    GoogleSignin.configure({
      webClientId:
        "62124302433-lo8866g3pedouubfd7240ic5bu4kr6vi.apps.googleusercontent.com",
      offlineAccess: false,
      forceCodeForRefreshToken: false,
    });
  }, []);

  // 🔔 Push notifications
  useEffect(() => {
    let unsubOpen: (() => void) | undefined;

    (async () => {
      try {
        await messaging().requestPermission();
        const token = await messaging().getToken();
        await api.post?.("/devices/register", {
          token,
          platform: Platform.OS,
        });
      } catch (e) {
        console.log("push init error:", e);
      }
    })();

    unsubOpen = messaging().onNotificationOpenedApp((rm) => {
      const route = rm?.data?.route as string | undefined;
      const params =
        rm?.data?.params && typeof rm.data.params === "string"
          ? JSON.parse(rm.data.params)
          : undefined;
      if (route) navigate(route as never, params as never);
    });

    messaging()
      .getInitialNotification()
      .then((rm) => {
        const route = rm?.data?.route as string | undefined;
        const params =
          rm?.data?.params && typeof rm.data.params === "string"
            ? JSON.parse(rm.data.params)
            : undefined;
        if (route) navigate(route as never, params as never);
      })
      .catch(() => {});

    return () => {
      if (unsubOpen) unsubOpen();
    };
  }, []);

  if (boot === "loading") return null;
  const initialRoute = boot === "welcome" ? "Welcome" : "AuthGate";

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShadowVisible: false }}
        >
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AuthGate"
            component={AuthGate}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: "Recuperar contraseña" }}
          />
          <Stack.Screen
            name="Tabs"
            component={Tabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: "Detalle de producto" }}
          />
          <Stack.Screen
            name="SellerProfile"
            component={SellerProfileScreen}
            options={{ title: "Perfil del emprendedor" }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Map" component={MapScreen} options={{ title: "Mapa" }} />
          <Stack.Screen
            name="Reels"
            component={ReelsFeedScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="CustomerProfile" component={CustomerProfileScreen} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Configuración" }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: "Editar perfil" }}
          />
          <Stack.Screen
            name="MyReels"
            component={MyReelsScreen}
            options={{ title: "Mis Reels" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}