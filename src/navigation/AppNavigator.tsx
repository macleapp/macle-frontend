// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useRole } from "../context/RoleProvider";

// Screens (ajusta rutas si cambian)
import HomeScreen from "../screens/HomeScreen";
import MessagesScreen from "../screens/MessagesScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MyServicesScreen from "../screens/seller/MyServicesScreen";
import AgendaScreen from "../screens/seller/AgendaScreen";
import MyCatalogScreen from "../screens/seller/MyCatalogScreen";

import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** Tabs principales, cambian según el role */
function AppTabs() {
  const { user } = useRole();
  const role = (user?.role as
    | "client"
    | "seller_services"
    | "seller_products"
    | "both") ?? "client";

  if (role === "seller_services") {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Mensajes" component={MessagesScreen} />
        <Tab.Screen name="Mis Servicios" component={MyServicesScreen} />
        <Tab.Screen name="Agenda" component={AgendaScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }

  if (role === "seller_products") {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Mensajes" component={MessagesScreen} />
        <Tab.Screen name="Mi Catálogo" component={MyCatalogScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }

  if (role === "both") {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Mensajes" component={MessagesScreen} />
        <Tab.Screen name="Servicios" component={MyServicesScreen} />
        <Tab.Screen name="Productos" component={MyCatalogScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }

  // client (por defecto)
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Categorías" component={HomeScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Mensajes" component={MessagesScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/** Navegador raíz */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
        {/* Onboarding / Auth */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* App principal (tabs) */}
        <Stack.Screen name="Main" component={AppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}