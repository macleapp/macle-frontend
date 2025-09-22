// src/screens/SellerProfileScreen.tsx
import React, { useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Share,
  Linking,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = { key: string; name: "SellerProfile"; params: { id: number } };

const COLORS = {
  primary: "#1506e6ff",
  blue: "#3b82f6",
  bg: "#ffffff",
  text: "#111827",
  subtext: "#6b7280",
  border: "#00000022",
  danger: "#ef4444",
  star: "#f59e0b",
};

// ===== Tipos =====
type BadgeCode = "real_photo" | "real_name" | "kindness" | "on_time" | "top_recommended";
type BadgeIcon = "user-check" | "id-card" | "smile" | "clock" | "award";

type Badge = {
  code: BadgeCode;
  label: string;
  description: string;
  icon: BadgeIcon;
  earnedAt: string; // ISO
};

type Verification = {
  status: "unverified" | "pending" | "verified" | "rejected";
  type: "paid_check";
};

type Seller = {
  id: number;
  name: string;
  bio?: string;
  category?: string;
  city?: string;
  country?: string;
  hours?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  avatarUrl?: string;
  followers: number;
  ratingAvg: number; // 0..5
  // Insignias y verificación
  verification: Verification;
  badges: Badge[];
};

type CatalogItem = {
  id: string;
  title: string;
  price?: string;
  thumb: string;
};

type Photo = { id: string; url: string };
type Reel = { id: string; thumbnail: string; videoUrl?: string };

// ===== Mock temporal (conecta luego tu backend) =====
const MOCK_BADGES: Badge[] = [
  {
    code: "real_photo",
    label: "Foto Real",
    description: "Tu foto de perfil fue validada.",
    icon: "user-check",
    earnedAt: "2025-09-10",
  },
  {
    code: "real_name",
    label: "Nombre Real",
    description: "Tu nombre fue verificado con documento.",
    icon: "id-card",
    earnedAt: "2025-09-12",
  },
  {
    code: "kindness",
    label: "Amabilidad ⭐",
    description: "Alta calificación y respuesta rápida.",
    icon: "smile",
    earnedAt: "2025-09-13",
  },
];

const MOCK_SELLER: Seller = {
  id: 10,
  name: "Dulce Arte HN",
  bio: "Repostería creativa y personalizada. Pasteles, postres y detalles para tus eventos.",
  category: "Gastronomía",
  city: "Tegucigalpa",
  country: "Honduras",
  hours: "Lun–Sáb 9:00 am – 6:00 pm",
  phone: "+504 9999-8888",
  whatsapp: "+504 9999-8888",
  email: "contacto@dulcearte.hn",
  website: "https://dulcearte.hn",
  avatarUrl:
    "https://images.unsplash.com/photo-1558222217-237c611d3a17?q=80&w=600&auto=format&fit=crop",
  followers: 1240,
  ratingAvg: 4.6,
  verification: { status: "verified", type: "paid_check" }, // ← check azul (pago-aprobado)
  badges: MOCK_BADGES,
};

const MOCK_CATALOG: CatalogItem[] = [
  {
    id: "c1",
    title: "Pastel Red Velvet (8 porciones)",
    price: "L 900",
    thumb:
      "https://images.unsplash.com/photo-1541782814455-3de0cc4de9a6?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "c2",
    title: "Cupcakes surtidos (12u)",
    price: "L 420",
    thumb:
      "https://images.unsplash.com/photo-1519865885898-a54a6f2c7eea?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "c3",
    title: "Cheesecake maracuyá",
    price: "L 650",
    thumb:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "c4",
    title: "Pastel de chocolate (10 porciones)",
    price: "L 980",
    thumb:
      "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?q=80&w=800&auto=format&fit=crop",
  },
];

const MOCK_PHOTOS: Photo[] = [
  {
    id: "p1",
    url: "https://images.unsplash.com/photo-1612208695882-c3c2a3c60b1b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p3",
    url: "https://images.unsplash.com/photo-1551024709-8f23befc6cf7?q=80&w=1200&auto=format&fit=crop",
  },
];

const MOCK_REELS: Reel[] = [
  {
    id: "v1",
    thumbnail:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "v2",
    thumbnail:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop",
  },
];

// ===== Reacciones =====
const REACTIONS = [
  { key: "like", label: "👍" },
  { key: "love", label: "❤" },
  { key: "want", label: "🤩" },
  { key: "rec", label: "🙌" },
  { key: "clap", label: "👏" },
  { key: "meh", label: "🥴" },
] as const;

type ReactionKey = (typeof REACTIONS)[number]["key"];
type ReactionCounts = Record<ReactionKey, number>;

// ====== Chat (con traducción por mensaje) ======
type ChatMsg = {
  id: string;
  author: "me" | "seller";
  text: string;
  lang: "es" | "en";
  translatedText?: string;
  translatedTo?: "es" | "en";
  showTranslated?: boolean;
};

const DEFAULT_USER_LANG: "es" | "en" = "es"; // puedes detectar por Device Locale si quieres

async function translateMessage(text: string, from: "es" | "en", to: "es" | "en"): Promise<string> {
  if (from === to) return text;
  return `[${to.toUpperCase()}] ${text}`;
}

// ======= COMPONENTES DE INSIGNIAS =======
function BadgeIconView({ icon, size = 14 }: { icon: BadgeIcon; size?: number }) {
  if (icon === "id-card") {
    return <MaterialCommunityIcons name="id-card" size={size} color={COLORS.text} />;
  }
  // resto con Feather
  const map: Record<Exclude<BadgeIcon, "id-card">, any> = {
    "user-check": "user-check",
    "smile": "smile",
    "clock": "clock",
    "award": "award",
  };
  return <Feather name={map[icon as Exclude<BadgeIcon, "id-card">]} size={size} color={COLORS.text} />;
}

function BadgePill({ b }: { b: Badge }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#fff",
      }}
    >
      <BadgeIconView icon={b.icon} />
      <Text style={{ color: COLORS.text, fontWeight: "700" }}>{b.label}</Text>
    </View>
  );
}

function BadgeRow({ badges }: { badges: Badge[] }) {
  if (!badges?.length) return null;
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 6, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {badges.map((b) => (
        <BadgePill key={b.code} b={b} />
      ))}
    </View>
  );
}

// ===== Reaction bar =====
function ReactionBar({
  counts,
  onReact,
}: {
  counts: ReactionCounts;
  onReact: (k: ReactionKey) => void;
}) {
  return (
    <View style={styles.reactionRow}>
      {REACTIONS.map((r) => (
        <TouchableOpacity
          key={r.key}
          onPress={() => onReact(r.key)}
          style={styles.reactionBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={{ fontSize: 16 }}>{r.label}</Text>
          <Text style={styles.reactionCount}>{counts[r.key] ?? 0}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ===== Media Cards =====
function PhotoCard({
  uri,
  counts,
  onReact,
}: {
  uri: string;
  counts: ReactionCounts;
  onReact: (k: ReactionKey) => void;
}) {
  return (
    <View style={styles.mediaCard}>
      <Image source={{ uri }} style={styles.mediaImage} />
      <ReactionBar counts={counts} onReact={onReact} />
    </View>
  );
}

function VideoCard({
  thumbnail,
  onPressPlay,
  counts,
  onReact,
}: {
  thumbnail: string;
  onPressPlay: () => void;
  counts: ReactionCounts;
  onReact: (k: ReactionKey) => void;
}) {
  return (
    <TouchableOpacity style={styles.mediaCard} onPress={onPressPlay} activeOpacity={0.9}>
      <Image source={{ uri: thumbnail }} style={styles.mediaImage} />
      <View style={styles.playOverlay}>
        <Feather name="play" size={28} color="#fff" />
      </View>
      <ReactionBar counts={counts} onReact={onReact} />
    </TouchableOpacity>
  );
}

// ====== ChatModal (con botón Traducir) ======
function ChatModal({
  visible,
  onClose,
  seller,
}: {
  visible: boolean;
  onClose: () => void;
  seller: Seller;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "1",
      author: "seller",
      text: "Hello! Do you prefer chocolate or vanilla?",
      lang: "en",
    },
    {
      id: "2",
      author: "me",
      text: "Hola, me interesan cupcakes surtidos para el sábado.",
      lang: "es",
    },
  ]);
  const [input, setInput] = useState("");
  const [autoTranslate, setAutoTranslate] = useState(false);
  const flatRef = useRef<FlatList<ChatMsg>>(null);

  const myLang = DEFAULT_USER_LANG;
  const otherLang: "es" | "en" = myLang === "es" ? "en" : "es";

  const send = useCallback(async () => {
    const txt = input.trim();
    if (!txt) return;
    const msg: ChatMsg = {
      id: String(Date.now()),
      author: "me",
      text: txt,
      lang: myLang,
    };
    setMessages((m) => [...m, msg]);
    setInput("");
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
  }, [input, myLang]);

  const handleTranslate = useCallback(
    async (msg: ChatMsg) => {
      const to = myLang;
      const from = msg.lang;
      if (from === to) return;

      let translated = msg.translatedText;
      if (!translated || msg.translatedTo !== to) {
        translated = await translateMessage(msg.text, from, to);
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? {
                ...m,
                translatedText: translated,
                translatedTo: to,
                showTranslated: !m.showTranslated ? true : !m.showTranslated,
              }
            : m
        )
      );
    },
    [myLang]
  );

  const maybeAutoTranslate = useCallback(
    async (incoming: ChatMsg) => {
      if (!autoTranslate) return incoming;
      if (incoming.lang === myLang) return { ...incoming };
      const translated = await translateMessage(incoming.text, incoming.lang, myLang);
      return {
        ...incoming,
        translatedText: translated,
        translatedTo: myLang,
        showTranslated: true,
      };
    },
    [autoTranslate, myLang]
  );

  const simulateReply = useCallback(async () => {
    const reply: ChatMsg = {
      id: String(Date.now() + 1),
      author: "seller",
      text: "Perfect, we can deliver on Saturday morning.",
      lang: "en",
    };
    const processed = await maybeAutoTranslate(reply);
    setMessages((m) => [...m, processed]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
  }, [maybeAutoTranslate]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Image source={{ uri: seller.avatarUrl }} style={styles.chatAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.chatTitle}>{seller.name}</Text>
            <Text style={styles.chatSubtitle}>
              Traducción: <Text style={{ fontWeight: "800" }}>{autoTranslate ? "Automática" : "Manual"}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setAutoTranslate((v) => !v)}
            style={[styles.autoBtn, autoTranslate && { backgroundColor: COLORS.primary }]}
          >
            <Feather name="globe" size={16} color={autoTranslate ? "#fff" : COLORS.text} />
            <Text style={[styles.autoTxt, autoTranslate && { color: "#fff" }]}>Auto</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => {
            const mine = item.author === "me";
            const bubble = item.showTranslated && item.translatedText ? item.translatedText : item.text;
            const showTranslateButton = item.lang !== myLang;

            return (
              <View
                style={[
                  styles.msgRow,
                  mine ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" },
                ]}
              >
                <View style={[styles.msgBubble, mine ? styles.msgMine : styles.msgOther]}>
                  <Text style={styles.msgText}>{bubble}</Text>
                  {item.translatedText && (
                    <TouchableOpacity
                      onPress={() =>
                        setMessages((prev) =>
                          prev.map((m) =>
                            m.id === item.id ? { ...m, showTranslated: !m.showTranslated } : m
                          )
                        )
                      }
                    >
                      <Text style={styles.msgSmall}>
                        {item.showTranslated ? "Ver original" : "Ver traducido"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {!mine && showTranslateButton && (
                  <TouchableOpacity
                    onPress={() => handleTranslate(item)}
                    style={styles.translateBtn}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather name="globe" size={14} color={COLORS.blue} />
                    <Text style={styles.translateTxt}>Traducir</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />

        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
        >
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escribe un mensaje..."
              style={styles.input}
              multiline
            />
            <TouchableOpacity onPress={send} style={styles.sendBtn}>
              <Feather name="send" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={simulateReply}
              style={[styles.sendBtn, { backgroundColor: COLORS.blue }]}
            >
              <Feather name="message-square" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

export default function SellerProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute() as unknown as {
    key: string;
    name: "SellerProfile";
    params?: { id?: number };
  };
  const sellerId = useMemo(() => route?.params?.id ?? MOCK_SELLER.id, [route]);

  // En producción, trae desde tu API con sellerId
  const [seller, setSeller] = useState<Seller>(MOCK_SELLER);
  const [following, setFollowing] = useState(false);

  // Chat modal
  const [chatOpen, setChatOpen] = useState(false);

  // Reacciones por media-id
  const [photoReactions, setPhotoReactions] = useState<Record<string, ReactionCounts>>({});
  const [videoReactions, setVideoReactions] = useState<Record<string, ReactionCounts>>({});

  const inc = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<Record<string, ReactionCounts>>>,
      id: string,
      key: ReactionKey
    ) => {
      setter((prev) => {
        const curr = prev[id] ?? { like: 0, love: 0, want: 0, rec: 0, clap: 0, meh: 0 };
        return { ...prev, [id]: { ...curr, [key]: (curr[key] ?? 0) + 1 } };
      });
    },
    []
  );

  const onReactPhoto = useCallback((id: string, k: ReactionKey) => inc(setPhotoReactions, id, k), [inc]);
  const onReactVideo = useCallback((id: string, k: ReactionKey) => inc(setVideoReactions, id, k), [inc]);

  const onFollow = useCallback(() => {
    setFollowing((f) => !f);
    setSeller((s) => ({ ...s, followers: s.followers + (following ? -1 : 1) }));
  }, [following]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Mira el perfil de ${seller.name} en MACLE`,
      });
    } catch {}
  }, [seller.name]);

  const openWhatsApp = useCallback(() => {
    if (!seller.whatsapp) return;
    const phone = seller.whatsapp.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${phone}`).catch(() =>
      Alert.alert("WhatsApp", "No se pudo abrir WhatsApp")
    );
  }, [seller.whatsapp]);

  const openPhone = useCallback(() => {
    if (!seller.phone) return;
    Linking.openURL(`tel:${seller.phone}`).catch(() =>
      Alert.alert("Teléfono", "No se pudo iniciar llamada")
    );
  }, [seller.phone]);

  const openEmail = useCallback(() => {
    if (!seller.email) return;
    Linking.openURL(`mailto:${seller.email}`).catch(() =>
      Alert.alert("Email", "No se pudo abrir el correo")
    );
  }, [seller.email]);

  const openWeb = useCallback(() => {
    if (!seller.website) return;
    Linking.openURL(seller.website).catch(() =>
      Alert.alert("Web", "No se pudo abrir el sitio")
    );
  }, [seller.website]);

  const Stars = useCallback(({ value }: { value: number }) => {
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        {Array.from({ length: full }).map((_, i) => (
          <MaterialIcons key={`f-${i}`} name="star" size={18} color={COLORS.star} />
        ))}
        {half && <MaterialIcons name="star-half" size={18} color={COLORS.star} />}
        {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
          <MaterialIcons key={`e-${i}`} name="star-border" size={18} color={COLORS.star} />
        ))}
        <Text style={{ color: COLORS.subtext, marginLeft: 4 }}>{value.toFixed(1)}</Text>
      </View>
    );
  }, []);

  const locationText = [seller.city, seller.country].filter(Boolean).join(", ");

  const openProductDetail = useCallback(
    (id: string) => navigation.navigate("ProductDetail", { id: Number(id) }),
    [navigation]
  );

  const ContactButton = ({
    icon,
    label,
    onPress,
    disabled,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.contactBtn, disabled && { opacity: 0.4 }]}>
      <Feather name={icon as any} size={18} color={COLORS.text} />
      <Text style={styles.contactTxt}>{label}</Text>
    </TouchableOpacity>
  );

  const renderCatalogItem = ({ item }: { item: CatalogItem }) => (
    <TouchableOpacity style={styles.catCard} onPress={() => openProductDetail(item.id)}>
      <Image source={{ uri: item.thumb }} style={styles.catImg} />
      <View style={{ padding: 8 }}>
        <Text style={styles.catTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {!!item.price && <Text style={styles.catPrice}>{item.price}</Text>}
        <TouchableOpacity onPress={() => openProductDetail(item.id)} style={styles.catMoreBtn}>
          <Text style={styles.catMoreTxt}>Ver más</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Header: avatar + nombre + check + insignias + follow + rating */}
        <View style={styles.header}>
          <Image source={{ uri: seller.avatarUrl }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Text style={styles.name}>{seller.name}</Text>
              {seller.verification?.status === "verified" && (
                <Feather name="check-circle" size={18} color={COLORS.blue} />
              )}
            </View>

            {/* FILA DE INSIGNIAS */}
            <BadgeRow badges={seller.badges} />

            <View style={styles.followRow}>
              <TouchableOpacity
                onPress={onFollow}
                style={[
                  styles.followBtn,
                  following && { backgroundColor: "#fff", borderColor: COLORS.primary, borderWidth: 1 },
                ]}
              >
                <Text style={[styles.followTxt, following && { color: COLORS.primary }]}>
                  {following ? "Siguiendo" : "Seguir"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.followCount}>{seller.followers.toLocaleString()} seguidores</Text>
            </View>
            <Stars value={seller.ratingAvg} />
          </View>
        </View>

        {/* Aviso + Cómo ganar insignias (si NO verificado) */}
        {seller.verification?.status !== "verified" && (
          <View style={styles.noticeCard}>
            <Feather name="info" size={16} color={COLORS.blue} />
            <Text style={styles.noticeTxt}>
              Para generar confianza, usa tu <Text style={{ fontWeight: "800" }}>nombre</Text> y{" "}
              <Text style={{ fontWeight: "800" }}>foto reales</Text>. Perfiles completos reciben más contactos.
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Insignias",
              "• Foto Real: sube una foto clara tuya.\n• Nombre Real: verifica tu identidad.\n• Amabilidad: rating ≥ 4.5, respuesta ≥ 80%, tiempo ≤ 1h.\n• Puntualidad: ≥95% de trabajos a tiempo.\n• Top Recomendado: top 10% del mes."
            )
          }
          style={{ alignSelf: "flex-start", marginLeft: 16, marginTop: 6 }}
        >
          <Text style={{ color: COLORS.blue, fontWeight: "800" }}>¿Cómo ganar insignias?</Text>
        </TouchableOpacity>

        {/* Presentación */}
        {!!seller.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Presentación</Text>
            <Text style={styles.sectionText}>{seller.bio}</Text>
          </View>
        )}

        {/* Datos rápidos */}
        <View style={styles.quickGrid}>
          {!!seller.category && (
            <View style={styles.quickItem}>
              <Feather name="tag" size={18} color={COLORS.text} />
              <Text style={styles.quickTxt}>{seller.category}</Text>
            </View>
          )}
          {!![seller.city, seller.country].filter(Boolean).length && (
            <View style={styles.quickItem}>
              <Feather name="map-pin" size={18} color={COLORS.text} />
              <Text style={styles.quickTxt}>
                {[seller.city, seller.country].filter(Boolean).join(", ")}
              </Text>
            </View>
          )}
          {!!seller.hours && (
            <View style={styles.quickItem}>
              <Feather name="clock" size={18} color={COLORS.text} />
              <Text style={styles.quickTxt}>{seller.hours}</Text>
            </View>
          )}
        </View>

        {/* Contacto directo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          <View style={styles.contactRow}>
            <ContactButton
              icon="message-circle"
              label="WhatsApp"
              onPress={openWhatsApp}
              disabled={!seller.whatsapp}
            />
            <ContactButton icon="phone" label="Teléfono" onPress={openPhone} disabled={!seller.phone} />
            <ContactButton icon="mail" label="Email" onPress={openEmail} disabled={!seller.email} />
            <ContactButton icon="globe" label="Sitio" onPress={openWeb} disabled={!seller.website} />
          </View>
        </View>

        {/* Catálogo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catálogo</Text>
          <FlatList
            data={MOCK_CATALOG}
            keyExtractor={(i) => i.id}
            renderItem={renderCatalogItem}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
            scrollEnabled={false}
          />
        </View>

        {/* Galería */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Galería</Text>
          <FlatList
            data={MOCK_PHOTOS}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => (
              <PhotoCard
                uri={item.url}
                counts={photoReactions[item.id] ?? { like: 0, love: 0, want: 0, rec: 0, clap: 0, meh: 0 }}
                onReact={(k) => onReactPhoto(item.id, k)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            scrollEnabled={false}
          />
        </View>

        {/* Reels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reels</Text>
          <FlatList
            data={MOCK_REELS}
            keyExtractor={(v) => v.id}
            renderItem={({ item }) => (
              <VideoCard
                thumbnail={item.thumbnail}
                onPressPlay={() => Alert.alert("Reel", "Abrir reproductor o detalle")}
                counts={videoReactions[item.id] ?? { like: 0, love: 0, want: 0, rec: 0, clap: 0, meh: 0 }}
                onReact={(k) => onReactVideo(item.id, k)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            scrollEnabled={false}
          />
        </View>

        {/* Reseñas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reseñas</Text>
          <View style={styles.reviewCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&q=80&auto=format&fit=crop",
                }}
                style={styles.reviewAvatar}
              />
              <Text style={styles.reviewName}>María G.</Text>
            </View>
            <View style={{ marginTop: 6 }}>
              <Stars value={5} />
              <Text style={styles.sectionText}>"Pastel delicioso y entrega puntual."</Text>
            </View>
          </View>
          <View style={styles.reviewCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200&q=80&auto=format&fit=crop",
                }}
                style={styles.reviewAvatar}
              />
              <Text style={styles.reviewName}>Carlos L.</Text>
            </View>
            <View style={{ marginTop: 6 }}>
              <Stars value={4} />
              <Text style={styles.sectionText}>"Muy buena atención. Recomendado."</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Barra inferior fija */}
      <View style={styles.fixedBar}>
        <TouchableOpacity onPress={onFollow} style={styles.fixedBtn}>
          <Feather name={following ? "user-check" : "user-plus"} size={18} color="#fff" />
          <Text style={styles.fixedTxt}>{following ? "Siguiendo" : "Seguir"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setChatOpen(true)} style={styles.fixedBtn}>
          <Feather name="message-circle" size={18} color="#fff" />
          <Text style={styles.fixedTxt}>Chatear</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShare} style={styles.fixedBtn}>
          <Feather name="share-2" size={18} color="#fff" />
          <Text style={styles.fixedTxt}>Compartir</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de chat con traducción */}
      <ChatModal visible={chatOpen} onClose={() => setChatOpen(false)} seller={seller} />
    </SafeAreaView>
  );
}

// ===== Estilos =====
const AVATAR = 84;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  name: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  followRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  followBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  followTxt: { color: "#fff", fontWeight: "700" },
  followCount: { color: COLORS.subtext },

  noticeCard: {
    margin: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  noticeTxt: { color: COLORS.text, flex: 1 },

  section: { padding: 16, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  sectionText: { color: COLORS.text },

  quickGrid: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickTxt: { color: COLORS.text },

  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactTxt: { color: COLORS.text },

  catCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  catImg: { width: "100%", height: 110 },
  catTitle: { color: COLORS.text, fontWeight: "700" },
  catPrice: { color: COLORS.primary, marginTop: 2, fontWeight: "700" },
  catMoreBtn: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  catMoreTxt: { color: "#fff", fontWeight: "700" },

  mediaCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  mediaImage: { width: "100%", height: 220 },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  reactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reactionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  reactionCount: { color: COLORS.subtext },

  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 10,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewName: { color: COLORS.text, fontWeight: "700" },

  fixedBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  fixedBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  fixedTxt: { color: "#fff", fontWeight: "800" },

  // ===== Chat styles =====
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  chatAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border },
  chatTitle: { color: COLORS.text, fontWeight: "900" },
  chatSubtitle: { color: COLORS.subtext, fontSize: 12 },
  autoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  autoTxt: { color: COLORS.text, fontWeight: "700" },

  msgRow: { width: "100%", flexDirection: "row", alignItems: "flex-end" },
  msgBubble: {
    maxWidth: "78%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgMine: { backgroundColor: "#e6fafb", marginLeft: 40 },
  msgOther: { backgroundColor: "#fff", marginRight: 40 },
  msgText: { color: COLORS.text },
  msgSmall: { color: COLORS.blue, marginTop: 4, fontSize: 12, fontWeight: "700" },
  translateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 6,
    padding: 6,
  },
  translateTxt: { color: COLORS.blue, fontSize: 12, fontWeight: "800" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.text,
    backgroundColor: "#fff",
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
});