// src/navigation/Tabs.tsx
import React from "react";
import { Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import PublishScreen from "../screens/PublishScreen";
import MessagesScreen from "../screens/MessagesScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import ProfileScreen from "../screens/ProfileScreen";

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Publish: undefined;
  Messages: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, { filled: string; outline: string }> = {
  Home: { filled: "home", outline: "home-outline" },
  Search: { filled: "search", outline: "search-outline" },
  Publish: { filled: "add-circle", outline: "add-circle-outline" },
  Messages: { filled: "chatbubble", outline: "chatbubble-outline" },
  Favorites: { filled: "heart", outline: "heart-outline" },
  Profile: { filled: "person", outline: "person-outline" },
};

export default function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: "#fff", height: 80 },
        headerShadowVisible: false,
        tabBarActiveTintColor: "#1506e6ff",
        tabBarInactiveTintColor: "black",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#00000022",
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 6,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const key = route.name as keyof TabParamList;
          const name = focused ? ICONS[key].filled : ICONS[key].outline;
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: "",
          headerLeft: () => (
            <Image
              source={require("../assets/images/logo-horizontal.png")}
              style={{ width: 160, height: 40, resizeMode: "contain" }}
            />
          ),
          headerLeftContainerStyle: { marginLeft: 12, marginTop: 12 },
        }}
      />

      <Tab.Screen name="Search" component={SearchScreen} options={{ title: "Buscar" }} />
      <Tab.Screen name="Publish" component={PublishScreen} options={{ title: "Publicar" }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: "Mensajes" }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Favoritos" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  );
}