// src/screens/ProductDetailScreen.tsx
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { COLORS } from "../theme/colors";

// 🚨 MOCK temporal (borra esto cuando ya tengas tus datos reales)
const MOCK = {
  title: "Cámara Mirrorless Sony a6400",
  price: "$ 12,500",
  category: "Electrónica",
  location: "Tegucigalpa, Honduras",
  sellerName: "Juan Pérez",
  sellerId: "123",
  avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=300",
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProductDetail"
>;

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView style={styles.container}>
      {/* Imagen del producto */}
      <Image source={{ uri: MOCK.avatar }} style={styles.image} />

      {/* Título */}
      <Text style={styles.title}>{MOCK.title}</Text>

      {/* Meta info */}
      <View style={styles.rowBetween}>
        <Text style={styles.meta}>{MOCK.category}</Text>
        <Text style={styles.price}>{MOCK.price}</Text>
      </View>

      <Text style={styles.meta}>{MOCK.location}</Text>

      {/* Info del vendedor */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("SellerProfile", { sellerId: MOCK.sellerId })
        }
      >
        <View style={[styles.rowBetween, { marginTop: 12 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Image source={{ uri: MOCK.avatar }} style={styles.avatar} />
            <Text style={styles.seller}>{MOCK.sellerName}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={styles.sellerSub}>Ver perfil del vendedor</Text>
            <Feather name="chevron-right" size={20} color={COLORS.subtext} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Acciones */}
      <View style={[styles.rowBetween, { marginTop: 20 }]}>
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnTxt}>Contactar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnOutline]}>
          <Text style={[styles.btnTxt, styles.btnOutlineTxt]}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  seller: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  sellerSub: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  btn: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 4,
  },
  btnTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  btnOutlineTxt: {
    color: COLORS.primary,
  },
});