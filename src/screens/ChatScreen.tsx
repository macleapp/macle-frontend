// src/screens/ChatScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = { sellerId: number; sellerName?: string; autoTranslate?: boolean };

const COLORS = {
  bg: "#ffffff",
  text: "#111827",
  subtext: "#6b7280",
  border: "#00000022",
  primary: "#0ea5b7",
  bubbleMe: "#DCF7FF",
  bubbleOther: "#F4F6F8",
  danger: "#ef4444",
};

type Msg = {
  id: string;
  from: "me" | "seller";
  text: string;
  createdAt: number;
  lang?: "es" | "en" | "other";
  translatedText?: string;
  translatedTo?: "es" | "en";
};

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ------- Detección súper ligera (heurística) -------
function detectLang(t: string): "es" | "en" | "other" {
  const s = t.toLowerCase();
  const esHits = ["hola", "gracias", "por favor", "buenos", "buenas", "disculpa", "envío", "precio", "lps", "honduras", "enviar", "comprar", "venta", "servicio", "producto", "pastel", "teléfono", "ciudad"];
  const enHits = ["hello", "thanks", "please", "good", "sorry", "ship", "price", "usd", "send", "buy", "sale", "service", "product", "cake", "phone", "city"];
  const esScore = esHits.reduce((acc, w) => acc + (s.includes(w) ? 1 : 0), 0) + (/[áéíóúñ]/.test(s) ? 1 : 0);
  const enScore = enHits.reduce((acc, w) => acc + (s.includes(w) ? 1 : 0), 0);
  if (esScore > enScore && esScore >= 1) return "es";
  if (enScore > esScore && enScore >= 1) return "en";
  return "other";
}

function getUserPreferredLang(): "es" | "en" {
  const loc = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  if (loc.startsWith("es")) return "es";
  return "en";
}

// ------- Traducción -------
// Si tienes backend, expón POST /api/tools/translate { text, target }
// y devuelve { text: "..." }.
async function translateViaServer(text: string, target: "es" | "en") {
  try {
    const res = await fetch("http://10.0.2.2:3000/api/tools/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = (await res.json()) as { text?: string };
    return data?.text || text;
  } catch {
    return text; // fallback: no traduce
  }
}

// Fallback local (si no hay backend de traducción). Aquí solo devuelve el mismo texto.
async function translateLocalFallback(text: string) {
  return text; // puedes poner un sufijo para debug: ${text} (translated)
}

async function translateSmart(text: string, target: "es" | "en") {
  // Primero intenta servidor; si falla, usa fallback local
  const viaServer = await translateViaServer(text, target);
  if (viaServer !== text) return viaServer;
  return translateLocalFallback(text);
}

export default function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute() as any;
  const params = (route?.params || {}) as RouteParams;
  const sellerId = params.sellerId;
  const sellerName = params.sellerName || "Emprendedor";
  const userLang = useMemo(getUserPreferredLang, []);
  const [autoTranslate, setAutoTranslate] = useState<boolean>(params.autoTranslate ?? true);

  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  const flatRef = useRef<FlatList<Msg>>(null);

  // Mock: cargar historial (reemplaza con tu API real)
  useEffect(() => {
    (async () => {
      // const resp = await fetch(http://10.0.2.2:3000/api/chat/history?sellerId=${sellerId});
      // const data = await resp.json();
      // setMessages(data.items);
      const seed: Msg[] = [
        {
          id: genId(),
          from: "seller",
          text: "Hola, ¡gracias por escribir! ¿En qué puedo ayudarte?",
          createdAt: Date.now() - 1000 * 60 * 8,
          lang: "es",
        },
        {
          id: genId(),
          from: "me",
          text: "Hi! I want to know your delivery options to the US.",
          createdAt: Date.now() - 1000 * 60 * 6,
          lang: "en",
        },
      ];
      setMessages(seed);
    })();
  }, [sellerId]);

  // Traducir automáticamente mensajes entrantes (del vendedor) hacia el idioma del usuario
  useEffect(() => {
    if (!autoTranslate) return;
    (async () => {
      const newMsgs = await Promise.all(
        messages.map(async (m) => {
          if (m.from !== "seller") return m;
          const lang = m.lang || detectLang(m.text);
          // si ya está en el idioma del usuario, no traducir
          if ((userLang === "es" && lang === "es") || (userLang === "en" && lang === "en")) return { ...m, lang };
          const translated = await translateSmart(m.text, userLang);
          return { ...m, lang, translatedText: translated, translatedTo: userLang };
        })
      );
      setMessages((prev) => {
        // evita loops: solo reemplaza si hay cambios
        const changed =
          prev.length !== newMsgs.length ||
          prev.some((p, i) => p.translatedText !== newMsgs[i].translatedText || p.lang !== newMsgs[i].lang);
        return changed ? newMsgs : prev;
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTranslate, userLang]);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      flatRef.current?.scrollToEnd({ animated: true });
    });
  };

  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);

    const mine: Msg = {
      id: genId(),
      from: "me",
      text,
      createdAt: Date.now(),
      lang: detectLang(text),
    };
    setMessages((prev) => [...prev, mine]);
    setInput("");
    scrollToEnd();

    try {
      // Llama a tu backend real:
      // await fetch("http://10.0.2.2:3000/api/chat/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sellerId, text }) });

      // Mock de respuesta del vendedor:
      setTimeout(async () => {
        const replyText =
          mine.lang === "en"
            ? "Claro, hacemos envíos internacionales. ¿A qué ciudad?"
            : "Sure! We ship worldwide. Which city are you in?";

        const reply: Msg = {
          id: genId(),
          from: "seller",
          text: replyText,
          createdAt: Date.now(),
          lang: detectLang(replyText),
        };

        // aplicar traducción automática si procede
        let toPush = reply;
        if (autoTranslate) {
          const lang = reply.lang || detectLang(reply.text);
          if (!((userLang === "es" && lang === "es") || (userLang === "en" && lang === "en"))) {
            const translated = await translateSmart(reply.text, userLang);
            toPush = { ...reply, lang, translatedText: translated, translatedTo: userLang };
          }
        }

        setMessages((prev) => [...prev, toPush]);
        scrollToEnd();
      }, 800);
    } catch (e: any) {
      Alert.alert("Chat", e?.message || "No se pudo enviar el mensaje");
    } finally {
      setSending(false);
    }
  }, [autoTranslate, input, sellerId, sending, userLang]);

  const togglePerMessage = useCallback(
    async (m: Msg) => {
      // Si no hay traducción todavía, traduce al vuelo.
      const lang = m.lang || detectLang(m.text);
      const wantTo = userLang === "es" ? "en" : "es";

      // Si ya hay traducción y es hacia userLang, mostrar/ocultar
      const alreadyHas = m.translatedText && m.translatedTo;
      const flipToOriginal = alreadyHas && m.translatedTo === userLang;

      setMessages((prev) =>
        prev.map((x) => {
          if (x.id !== m.id) return x;
          if (flipToOriginal) {
            // limpiar para ver original
            const { translatedText, translatedTo, ...rest } = x;
            return { ...rest, lang };
          } else {
            return x;
          }
        })
      );

      // Si no había traducción precomputada, traducir ahora
      if (!alreadyHas) {
        const translated = await translateSmart(m.text, userLang);
        setMessages((prev) =>
          prev.map((x) => (x.id === m.id ? { ...x, translatedText: translated, translatedTo: userLang, lang } : x))
        );
      }
    },
    [userLang]
  );

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
        <Feather name="chevron-left" size={24} color={COLORS.text} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{sellerName}</Text>
        <Text style={styles.subtitle}>
          Chat • Idioma preferido: {userLang === "es" ? "Español" : "English"}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setAutoTranslate((v) => !v)}
        style={[styles.iconBtn, autoTranslate && { backgroundColor: COLORS.primary }]}
      >
        <Feather name="globe" size={18} color={autoTranslate ? "#fff" : COLORS.text} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Msg }) => {
    const mine = item.from === "me";
    const show = item.translatedText && autoTranslate ? item.translatedText : item.text;
    const langBadge =
      item.translatedText && autoTranslate
        ? `→ ${item.translatedTo?.toUpperCase()}`
        : (item.lang || detectLang(item.text)).toUpperCase();

    return (
      <View style={[styles.row, mine ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
        <View
          style={[
            styles.bubble,
            mine ? styles.bubbleMe : styles.bubbleOther,
            { maxWidth: "82%" },
          ]}
        >
          <Text style={styles.msgTxt}>{show}</Text>
          <View style={styles.bubbleFooter}>
            <Text style={styles.badge}>{langBadge}</Text>
            {item.from === "seller" && (
              <TouchableOpacity onPress={() => togglePerMessage(item)} style={styles.translateBtn}>
                <Feather name="refresh-ccw" size={14} color={COLORS.subtext} />
                <Text style={styles.translateTxt}>
                  {item.translatedText && autoTranslate ? "Ver original" : "Traducir"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const ItemSeparator = () => <View style={{ height: 8 }} />;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <Header />
        <FlatList
          ref={flatRef}
          data={messages.sort((a, b) => a.createdAt - b.createdAt)}
          renderItem={renderItem}
          keyExtractor={(m) => m.id}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={{ padding: 12, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
          onLayout={scrollToEnd}
        />

        <View style={styles.inputBar}>
          <TouchableOpacity
            onPress={() => setAutoTranslate((v) => !v)}
            style={[styles.toggle, autoTranslate && { backgroundColor: COLORS.primary }]}
          >
            <Feather name="globe" size={16} color={autoTranslate ? "#fff" : COLORS.text} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={autoTranslate ? "Escribe (traducción automática activada)" : "Escribe un mensaje"}
            placeholderTextColor={COLORS.subtext}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity onPress={onSend} disabled={!input.trim() || sending} style={styles.sendBtn}>
            <Feather name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ====================
   ESTILOS
   ==================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
  },
  title: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },

  row: { flexDirection: "row", paddingHorizontal: 12 },
  bubble: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleMe: { backgroundColor: COLORS.bubbleMe },
  bubbleOther: { backgroundColor: COLORS.bubbleOther },
  msgTxt: { color: COLORS.text, fontSize: 15 },
  bubbleFooter: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    fontSize: 11,
    color: COLORS.subtext,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  translateBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  translateTxt: { fontSize: 12, color: COLORS.subtext, fontWeight: "600" },

  inputBar: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
    alignItems: "flex-end",
  },
  toggle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    backgroundColor: "#fff",
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
})