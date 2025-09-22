// src/screens/MyProductsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TabsParamList, RootStackParamList } from "../navigation/types";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabsParamList, "MyProducts">,
  NativeStackNavigationProp<RootStackParamList>
>;

type Product = {
  id: number;
  name: string;
};

export default function MyProductsScreen() {
  const navigation = useNavigation<Nav>();

  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    // Simulación: en producción debes traerlos del backend
    setProducts([
      { id: 1, name: "Producto A" },
      { id: 2, name: "Producto B" },
    ]);
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openProduct = (p: Product) => {
    navigation.navigate("ProductDetail", { id: p.id });
  };

  const deleteProduct = async (id: number) => {
    Alert.alert(
      "Eliminar",
      "¿Deseas eliminar este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setProducts((prev) => prev.filter((p) => p.id !== id));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity onPress={() => openProduct(item)}>
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteProduct(item.id)}>
              <Text style={styles.delete}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: { fontSize: 16 },
  delete: { color: "red" },
});